/**
 * User mappers.
 */
export function toUserResponse(user) {
  if (!user) return null;
  const u = user.toObject ? user.toObject() : user;
  return {
    id: u._id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    role: u.role,
    profileImage: u.profileImage,
    preferredLanguage: u.preferredLanguage,
    createdAt: u.createdAt,
  };
}

export function toProfileResponse(user) {
  const base = toUserResponse(user);
  if (!base) return null;
  const u = user.toObject ? user.toObject() : user;
  return {
    ...base,
    isNewUser: u.isNewUser,
    defaultAddressId: u.defaultAddressId || null,
  };
}
