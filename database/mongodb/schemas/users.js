import mongoose from 'mongoose';

/**
 * users — customers, delivery partners, store managers, admins.
 */
const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true },
    name: { type: String, trim: true },
    role: {
      type: String,
      enum: ['CUSTOMER', 'DELIVERY_PARTNER', 'STORE_MANAGER', 'ADMIN'],
      default: 'CUSTOMER',
    },
    isNewUser: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    profileImage: { type: String },
    preferredLanguage: { type: String, default: 'en' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1, isActive: 1 });

export const UserSchema = userSchema;
