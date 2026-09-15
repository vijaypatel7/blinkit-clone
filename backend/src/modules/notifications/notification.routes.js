import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import { notificationController } from './notification.controller.js';
import { listNotificationsQuerySchema } from './notification.validation.js';
import { idParamSchema } from '../../common/validators/querySchemas.js';

/**
 * Notification routes (authenticated).
 */
export const notificationRoutes = Router();

notificationRoutes.get('/', validateRequest({ query: listNotificationsQuerySchema }), notificationController.list);
notificationRoutes.get('/unread-count', notificationController.unreadCount);
notificationRoutes.patch('/:id/read', validateRequest({ params: idParamSchema }), notificationController.markRead);
