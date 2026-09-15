import { serializeOne } from '../../common/serializers/index.js';

/**
 * Auth mappers — shape auth objects for API responses.
 */
export function toAuthResponse({ user, accessToken, refreshToken, expiresIn }) {
  return {
    user: user ? toUserSummary(user) : null,
    accessToken,
    refreshToken,
    expiresIn,
    tokenType: 'Bearer',
  };
}

export function toUserSummary(user) {
  const plain = serializeOne(user, (u) => u);
  return {
    id: plain._id,
    name: plain.name,
    phone: plain.phone,
    email: plain.email,
    role: plain.role,
    isNewUser: plain.isNewUser,
  };
}
