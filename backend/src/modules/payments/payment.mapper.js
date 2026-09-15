/**
 * Payment mappers.
 */
export function toPaymentResponse(payment) {
  if (!payment) return null;
  const p = payment.toObject ? payment.toObject() : payment;
  return {
    id: p._id,
    orderId: p.orderId,
    amountPaise: p.amountPaise,
    method: p.method,
    status: p.status,
    gatewayReference: p.gatewayReference,
    createdAt: p.createdAt,
  };
}
