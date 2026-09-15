/**
 * Address mappers.
 */
export function toAddressResponse(address) {
  if (!address) return null;
  const a = address.toObject ? address.toObject() : address;
  return {
    id: a._id,
    type: a.type,
    label: a.label,
    name: a.name,
    phone: a.phone,
    flat: a.flat,
    building: a.building,
    street: a.street,
    landmark: a.landmark,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    coordinates: a.location?.coordinates || null,
    isDefault: a.isDefault,
  };
}
