import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env } from '../../config/environment.js';
import { NotFoundError, ForbiddenError, BadRequestError, ServiceUnavailableError } from '../../common/errors/AppError.js';
import { paymentRepository } from './payment.repository.js';
import { orderRepository } from '../orders/order.repository.js';
import { orderService } from '../orders/order.service.js';
import { toPaymentResponse } from './payment.mapper.js';
import { logger } from '../../common/utils/logger.js';

/**
 * Payment service — Razorpay gateway.
 *
 * Online payments follow the standard Razorpay flow:
 *   1. `initiate` creates a Razorpay order server-side (amount in paise) and
 *      returns the `keyId` + `razorpayOrderId` the client needs to open the
 *      checkout modal.
 *   2. After the user pays in the Razorpay modal, the client calls `verify`
 *      with the payment id / order id / signature.
 *   3. `verify` recomputes the HMAC-SHA256 signature, marks the payment
 *      SUCCESS and moves the order → CONFIRMED via the state machine.
 *
 * Cash-on-delivery orders skip Razorpay entirely.
 */
export const paymentService = {
  /** Initiate a payment for an order; returns gateway details for the client. */
  async initiate(userId, { orderId, method }) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (String(order.userId) !== String(userId)) throw new ForbiddenError('Not your order');

    const payment = await paymentRepository.create({
      orderId,
      userId,
      amountPaise: order.totals.grandTotal,
      method,
      status: 'PENDING',
    });

    // COD needs no gateway — the order is already created.
    if (method === 'COD') {
      return {
        method: 'COD',
        payment: toPaymentResponse(await paymentRepository.findById(payment._id)),
      };
    }

    // ONLINE → create a Razorpay order.
    const razorpay = getRazorpayClient();
    const rzpOrder = await razorpay.orders.create({
      amount: order.totals.grandTotal, // Razorpay expects the smallest unit (paise)
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: String(order._id), userId: String(userId) },
    });

    await paymentRepository.updateStatus(payment._id, 'PENDING', {
      gatewayReference: rzpOrder.id,
    });
    await paymentRepository.recordTransaction({
      paymentId: payment._id,
      orderId,
      type: 'AUTHORIZE',
      amountPaise: order.totals.grandTotal,
      gatewayReference: rzpOrder.id,
    });

    return {
      method: 'ONLINE',
      keyId: env.razorpay.keyId,
      razorpayOrderId: rzpOrder.id,
      amount: order.totals.grandTotal,
      currency: 'INR',
      orderNumber: order.orderNumber,
      payment: toPaymentResponse(await paymentRepository.findById(payment._id)),
    };
  },

  /**
   * Verify a Razorpay payment signature and finalise the order.
   * The signature is HMAC-SHA256 of `${orderId}|${paymentId}` using the key
   * secret, per Razorpay's docs.
   */
  async verify(userId, { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (String(order.userId) !== String(userId)) throw new ForbiddenError('Not your order');

    const expected = crypto
      .createHmac('sha256', env.razorpay.keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expected !== razorpaySignature) {
      logger.warn({ orderId }, 'Razorpay signature mismatch');
      throw new BadRequestError('Payment verification failed');
    }

    const payment = await paymentRepository.findByOrder(orderId);
    if (!payment) throw new NotFoundError('Payment not found');

    await paymentRepository.updateStatus(payment._id, 'SUCCESS', {
      gatewayReference: razorpayPaymentId,
    });
    await paymentRepository.recordTransaction({
      paymentId: payment._id,
      orderId,
      type: 'CAPTURE',
      amountPaise: order.totals.grandTotal,
      gatewayReference: razorpayPaymentId,
    });

    // Move order → CONFIRMED.
    await orderService.markPaid(orderId);

    return {
      success: true,
      orderId,
      status: 'CONFIRMED',
    };
  },

  /** Handle a gateway webhook callback (signed). */
  async handleWebhook(signature, payload) {
    if (!verifyWebhookSignature(signature, payload)) {
      throw new BadRequestError('Invalid webhook signature');
    }

    const { orderId, gatewayReference, status, amountPaise } = payload;
    const payment = await paymentRepository.findByOrder(orderId);
    if (!payment) throw new NotFoundError('Payment not found');

    if (status === 'SUCCESS') {
      await paymentRepository.updateStatus(payment._id, 'SUCCESS', { gatewayReference });
      await paymentRepository.recordTransaction({
        paymentId: payment._id,
        orderId,
        type: 'CAPTURE',
        amountPaise,
        gatewayReference,
      });
      await orderService.markPaid(orderId);
    } else {
      await paymentRepository.updateStatus(payment._id, 'FAILED', { gatewayReference });
      await paymentRepository.recordTransaction({
        paymentId: payment._id,
        orderId,
        type: 'FAILURE',
        amountPaise,
        gatewayReference,
      });
    }

    return { acknowledged: true };
  },

  async getByOrder(userId, orderId) {
    const payment = await paymentRepository.findByOrder(orderId);
    if (!payment) throw new NotFoundError('Payment not found');
    if (String(payment.userId) !== String(userId)) throw new ForbiddenError('Not your payment');
    return toPaymentResponse(payment);
  },

  async refund(orderId) {
    const payment = await paymentRepository.findByOrder(orderId);
    if (!payment) throw new NotFoundError('Payment not found');
    await paymentRepository.updateStatus(payment._id, 'REFUNDED', { refundedAt: new Date() });
    await paymentRepository.recordTransaction({
      paymentId: payment._id,
      orderId,
      type: 'REFUND',
      amountPaise: payment.amountPaise,
    });
    return toPaymentResponse(await paymentRepository.findById(payment._id));
  },
};

/**
 * Lazily build the Razorpay client. Kept lazy so the app boots fine (and COD
 * works) even when no keys are configured; only online payments need them.
 */
let razorpayClient = null;
function getRazorpayClient() {
  const { keyId, keySecret } = env.razorpay;
  if (!keyId || !keySecret || keyId.includes('REPLACE_ME')) {
    throw new ServiceUnavailableError(
      'Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'
    );
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayClient;
}

function verifyWebhookSignature(signature, payload) {
  if (!env.razorpay.webhookSecret) return true; // dev mode
  const expected = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature || ''), Buffer.from(expected));
}
