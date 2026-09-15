import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/environment.js';
import { sessionClient } from '../../config/redis.js';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../../common/errors/AppError.js';
import { cacheKeys } from '../../cache/cacheKeys.js';
import { authRepository } from './auth.repository.js';
import { userRepository } from '../users/user.repository.js';
import { toAuthResponse } from './auth.mapper.js';
import { OTP_RESEND_COOLDOWN_SECONDS, DEMO_OTP } from './auth.constants.js';
import { logger } from '../../common/utils/logger.js';

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

/**
 * OTP store — Redis-backed with an in-memory fallback so the demo login flow
 * works even when Redis is unavailable (e.g. a quick local run).
 */
const memoryOtps = new Map();
const otpStore = {
  async get(key) {
    try {
      const v = await sessionClient.get(key);
      if (v != null) return v;
    } catch {
      /* fall through to memory */
    }
    const mem = memoryOtps.get(key);
    if (mem && mem.expiresAt > Date.now()) return mem.value;
    return null;
  },
  async set(key, value, ttlSeconds) {
    memoryOtps.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    try {
      await sessionClient.set(key, value, 'EX', ttlSeconds);
    } catch {
      /* memory fallback only */
    }
  },
  async del(key) {
    memoryOtps.delete(key);
    try {
      await sessionClient.del(key);
    } catch {
      /* ignore */
    }
  },
};

/**
 * Auth service.
 *
 * Phone + OTP flow (the Blinkit-style primary auth). We cache OTPs in Redis
 * with a short TTL and rate-limit resends.
 */
export const authService = {
  /**
   * Send a one-time password for `phone`.
   *
   * This build uses a FIXED demo OTP (see DEMO_OTP in auth.constants.js) rather
   * than a real SMS gateway, so the login / sign-up flow can be exercised
   * end-to-end without an external provider. The OTP is not surfaced to the
   * client; callers must already know the demo code.
   */
  async sendOtp({ phone, purpose }) {
    const key = cacheKeys.otp(phone, purpose);

    // Resend cooldown.
    const cooldown = await otpStore.get(`${key}:cooldown`);
    if (cooldown) {
      throw new BadRequestError(`Please wait before requesting another OTP`, {
        retryAfter: OTP_RESEND_COOLDOWN_SECONDS,
      });
    }

    // Always issue the fixed demo OTP — no SMS gateway is used in this build.
    await otpStore.set(key, DEMO_OTP, env.auth.otpTtlSeconds);
    await otpStore.set(`${key}:cooldown`, '1', OTP_RESEND_COOLDOWN_SECONDS);

    logger.info({ phone, purpose }, 'OTP issued (demo mode)');
    return { expiresIn: env.auth.otpTtlSeconds };
  },

  /**
   * Verify OTP and log the user in (create if first time).
   */
  async verifyOtp({ phone, otp, purpose }) {
    const key = cacheKeys.otp(phone, purpose);
    const stored = await otpStore.get(key);
    if (!stored) throw new UnauthorizedError('OTP expired or not requested');
    if (stored !== otp) throw new UnauthorizedError('Invalid OTP');

    // One-time use.
    await otpStore.del(key);
    await otpStore.del(`${key}:cooldown`);

    let user = await userRepository.findByPhone(phone);
    const isNewUser = !user;
    if (!user) {
      user = await userRepository.create({ phone, role: 'CUSTOMER', isNewUser: true });
    }

    return this._issueTokens(user);
  },

  /** Exchange a refresh token for a new token pair (rotating refresh). */
  async refresh(refreshToken) {
    const tokenHash = hashToken(refreshToken);
    const stored = await authRepository.findByHash(tokenHash);

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(stored.userId);
    if (!user) throw new NotFoundError('User not found');

    // Rotate: revoke old, issue new.
    await authRepository.revokeByHash(tokenHash);
    return this._issueTokens(user);
  },

  async logout(refreshToken) {
    if (refreshToken) await authRepository.revokeByHash(hashToken(refreshToken));
    return true;
  },

  /** Internal: build access + refresh tokens for a user. */
  async _issueTokens(user) {
    const accessToken = jwt.sign(
      { sub: user._id, role: user.role, phone: user.phone, sid: randomBytes(8).toString('hex') },
      env.auth.jwtSecret,
      { expiresIn: env.auth.accessTtl }
    );

    const refreshToken = randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30d
    await authRepository.createRefreshToken({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    });

    return toAuthResponse({
      user,
      accessToken,
      refreshToken,
      expiresIn: env.auth.accessTtl,
    });
  },
};
