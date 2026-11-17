import mongoose from 'mongoose';

const RETENTION_SECONDS = 365 * 24 * 60 * 60;

// One document per search "intent". While a shopper types ("gl" -> "glu" ->
// "gluta") the same document is updated rather than creating one per keystroke;
// see logSearch in lib/searchLog.js.
const searchLogSchema = new mongoose.Schema(
  {
    // Lowercased, whitespace-collapsed text, as shown in the admin.
    query: { type: String, required: true },
    // Anonymous per-tab id, only used to merge keystrokes into one search.
    sessionId: { type: String, required: true },
    source: { type: String, enum: ['navbar', 'shop'], default: 'navbar' },
    resultCount: { type: Number, default: 0 },
    // true when at least one product matched every word of the query.
    success: { type: Boolean, default: false },
  },
  { timestamps: true },
);

searchLogSchema.index({ sessionId: 1, updatedAt: -1 });
// Also serves date-range queries in the admin analytics.
searchLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_SECONDS });

export default mongoose.models.SearchLog || mongoose.model('SearchLog', searchLogSchema);
