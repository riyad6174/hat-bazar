import mongoose from 'mongoose';

const COMPLETED_RETENTION_SECONDS = 30 * 24 * 60 * 60;

// One document per phone number. A checkout moves through this record rather
// than creating new ones: active -> completed, and back to active only when
// the same customer starts a new checkout (a new token).
// "Abandoned" is not stored; see abandonedCheckoutFilter in lib/checkoutSessions.
const checkoutSessionSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    // Identifies one checkout attempt from one browser.
    token: { type: String, required: true, index: true },
    // Client timestamp of the save, used to discard out-of-order writes.
    seq: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    name: { type: String, default: '' },
    district: { type: String, default: '' },
    address: { type: String, default: '' },
    // JSON string, same format as Order.items.
    items: { type: String, default: '[]' },
    totalPrice: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    startedAt: { type: Date },
    lastActivityAt: { type: Date, required: true },
    completedAt: { type: Date, default: null },
    orderId: { type: String, default: null },
  },
  { timestamps: true },
);

checkoutSessionSchema.index({ status: 1, lastActivityAt: -1 });
// Completed records only exist to block late writes, so they can expire.
// Active records have completedAt: null, which a TTL index ignores.
checkoutSessionSchema.index(
  { completedAt: 1 },
  { expireAfterSeconds: COMPLETED_RETENTION_SECONDS },
);

export default mongoose.models.CheckoutSession ||
  mongoose.model('CheckoutSession', checkoutSessionSchema);
