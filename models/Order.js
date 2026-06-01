import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String, required: true },
    items: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    shippingCharge: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    orderId: { type: String, required: true, unique: true },
    orderDate: { type: String },
    submissionTime: { type: String },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancel'],
      default: 'pending',
    },
    responseStatus: {
      type: String,
      enum: ['called', 'number_off', 'did_not_pick', 'call_later', 'fake_order', null],
      default: null,
    },
    note: { type: String, default: '' },
  },
  { timestamps: true },
);

orderSchema.index({ name: 'text', phone: 'text', orderId: 'text' });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ responseStatus: 1 });

if (mongoose.models.Order && !mongoose.models.Order.schema.path('note')) {
  delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
