import mongoose from 'mongoose';

// Small key/value store for admin-panel state that does not belong on any
// business record, such as when the abandoned orders page was last viewed.
const adminStateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    seenAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.models.AdminState ||
  mongoose.model('AdminState', adminStateSchema);
