import mongoose from 'mongoose';

/**
 * Refresh token document.
 *
 * Refresh tokens are persisted so we can revoke them (logout) and rotate them
 * on use. Access tokens are stateless JWTs (never stored).
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true }, // sha256 of token
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
