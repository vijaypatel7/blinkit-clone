/**
 * Notification mappers.
 */
export function toNotificationResponse(notification) {
  if (!notification) return null;
  const n = notification.toObject ? notification.toObject() : notification;
  return {
    id: n._id,
    template: n.template,
    title: n.title,
    body: n.body,
    channel: n.channel,
    data: n.data,
    isRead: n.isRead,
    sentAt: n.sentAt,
  };
}
