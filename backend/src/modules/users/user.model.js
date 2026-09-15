import mongoose from 'mongoose';

/**
 * User model.
 *
 * Users are customers, delivery partners, store managers, or admins.
 * The phone number is the primary identity (Blinkit-style OTP login).
 */
const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: { type: String, lowercase: true, trim: true, index: true, sparse: true },
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

    // Store manager specific
    managedStoreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// NOTE: delivery partners live in a separate `delivery_partners` collection
// (see delivery.model.js) with its own 2dsphere index. The User model must NOT
// embed a geo-pointed subdocument — doing so would make MongoDB try to extract
// geo keys from every customer document and fail with "Can't extract geo keys".
userSchema.index({ role: 1, isActive: 1 });

export const User = mongoose.model('User', userSchema);
