import { Payment, PaymentTransaction } from './payment.model.js';

/**
 * Payment repository.
 */
export const paymentRepository = {
  async findById(paymentId) {
    return Payment.findById(paymentId);
  },

  async findByOrder(orderId) {
    return Payment.findOne({ orderId }).sort({ createdAt: -1 });
  },

  async create(data) {
    return Payment.create(data);
  },

  async updateStatus(paymentId, status, extra = {}) {
    return Payment.findByIdAndUpdate(paymentId, { $set: { status, ...extra } }, { new: true });
  },

  async recordTransaction(entry) {
    return PaymentTransaction.create(entry);
  },
};
