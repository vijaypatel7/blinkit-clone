import { RefreshToken } from './auth.model.js';

/**
 * Auth repository — data access for refresh tokens.
 */
export const authRepository = {
  async createRefreshToken({ userId, tokenHash, expiresAt, userAgent, ip }) {
    return RefreshToken.create({ userId, tokenHash, expiresAt, userAgent, ip });
  },

  async findByHash(tokenHash) {
    return RefreshToken.findOne({ tokenHash });
  },

  async revokeByHash(tokenHash) {
    return RefreshToken.updateOne({ tokenHash }, { $set: { revokedAt: new Date() } });
  },

  async revokeAllForUser(userId) {
    return RefreshToken.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
  },

  async pruneExpired() {
    return RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });
  },
};
