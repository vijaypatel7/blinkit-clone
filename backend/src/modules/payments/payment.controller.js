import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok, created } from '../../common/utils/response.js';
import { paymentService } from './payment.service.js';

/**
 * Payment controller.
 */
export const paymentController = {
  initiate: asyncHandler(async (req, res) =>
    created(res, await paymentService.initiate(req.user.id, req.body))
  ),

  verify: asyncHandler(async (req, res) =>
    ok(res, await paymentService.verify(req.user.id, req.body))
  ),

  getByOrder: asyncHandler(async (req, res) =>
    ok(res, await paymentService.getByOrder(req.user.id, req.params.orderId))
  ),

  webhook: asyncHandler(async (req, res) => {
    const signature = req.headers['x-webhook-signature'] || '';
    ok(res, await paymentService.handleWebhook(signature, req.body));
  }),

  refund: asyncHandler(async (req, res) =>
    ok(res, await paymentService.refund(req.params.orderId))
  ),
};
