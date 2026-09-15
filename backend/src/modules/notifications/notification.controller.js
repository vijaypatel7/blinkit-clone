import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { ok } from '../../common/utils/response.js';
import { notificationService } from './notification.service.js';

/**
 * Notification controller.
 */
export const notificationController = {
  list: asyncHandler(async (req, res) => {
    const { items, nextCursor, hasMore } = await notificationService.listByUser(req.user.id, req.query);
    ok(res, { items, nextCursor, hasMore });
  }),

  markRead: asyncHandler(async (req, res) =>
    ok(res, await notificationService.markRead(req.user.id, req.params.id))
  ),

  unreadCount: asyncHandler(async (req, res) =>
    ok(res, { count: await notificationService.unreadCount(req.user.id) })
  ),
};
