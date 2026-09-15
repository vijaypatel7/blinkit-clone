import mongoose from 'mongoose';

/**
 * Notification model — stores the notification record (for the user's inbox).
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    template: { type: String, required: true },
    title: { type: String },
    body: { type: String },
    channel: { type: String, enum: ['PUSH', 'SMS', 'EMAIL', 'WHATSAPP'] },
    data: { type: Map, of: String },
    isRead: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, sentAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
