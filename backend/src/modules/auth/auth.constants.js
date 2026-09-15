/**
 * Auth module constants.
 */
export const OTP_PURPOSE = {
  LOGIN: 'login',
  VERIFY: 'verify',
};

export const AUTH_ERROR_CODES = {
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_INVALID: 'OTP_INVALID',
  OTP_COOLDOWN: 'OTP_COOLDOWN',
};

/** Minimum seconds between OTP resends for the same phone. */
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

/**
 * Fixed demo OTP used for the login / sign-up flow (no real SMS gateway).
 * Entering this code verifies successfully; any other code is rejected.
 */
export const DEMO_OTP = '123456';
