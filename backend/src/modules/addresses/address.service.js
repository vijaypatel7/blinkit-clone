import { NotFoundError, BadRequestError } from '../../common/errors/AppError.js';
import { addressRepository } from './address.repository.js';
import { toAddressResponse } from './address.mapper.js';

/**
 * Address service.
 */
export const addressService = {
  async list(userId) {
    const addresses = await addressRepository.listByUser(userId);
    return addresses.map(toAddressResponse);
  },

  async create(userId, data) {
    const { coordinates, ...rest } = data;
    const payload = {
      ...rest,
      userId,
      location: coordinates ? { type: 'Point', coordinates } : undefined,
    };

    if (rest.isDefault) {
      await addressRepository.clearDefaults(userId, null);
    }

    const address = await addressRepository.create(payload);
    return toAddressResponse(address);
  },

  async update(userId, addressId, data) {
    const existing = await addressRepository.findById(addressId, userId);
    if (!existing) throw new NotFoundError('Address not found');

    const { coordinates, isDefault, ...rest } = data;
    const payload = { ...rest };
    if (coordinates) payload.location = { type: 'Point', coordinates };
    if (isDefault) await addressRepository.clearDefaults(userId, addressId);

    const updated = await addressRepository.update(addressId, userId, payload);
    return toAddressResponse(updated);
  },

  async setDefault(userId, addressId) {
    const existing = await addressRepository.findById(addressId, userId);
    if (!existing) throw new NotFoundError('Address not found');
    await addressRepository.clearDefaults(userId, addressId);
    const updated = await addressRepository.update(addressId, userId, { isDefault: true });
    return toAddressResponse(updated);
  },

  async remove(userId, addressId) {
    const removed = await addressRepository.remove(addressId, userId);
    if (!removed) throw new NotFoundError('Address not found');
    return { id: addressId };
  },
};
