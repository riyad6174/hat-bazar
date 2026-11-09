import { connectDB } from '@/lib/mongodb';
import { normalizePhone } from '@/lib/checkoutValidation';
import CheckoutSession from '@/models/CheckoutSession';
import AdminState from '@/models/AdminState';

const DUPLICATE_KEY = 11000;
const MAX_ITEMS = 50;
const ABANDONED_SEEN_KEY = 'abandoned-orders';

const configuredMinutes = Number(process.env.ABANDONED_CHECKOUT_MINUTES);
export const ABANDONED_AFTER_MINUTES =
  configuredMinutes > 0 ? configuredMinutes : 30;
const ABANDONED_AFTER_MS = ABANDONED_AFTER_MINUTES * 60 * 1000;

const clip = (value, max) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, MAX_ITEMS).map((item) => ({
    title: clip(item?.title, 200),
    selectedColor: clip(item?.selectedColor, 50) || 'N/A',
    quantity: toAmount(item?.quantity),
    price: toAmount(item?.price),
  }));
}

/**
 * Applies one progressive save. Returns { saved: false } for a write that lost
 * a race (out of order, or arriving after the order completed); those are
 * expected and are not errors.
 */
export async function saveCheckoutProgress(input) {
  const phone = normalizePhone(input?.phone);
  const token = clip(input?.token, 64);
  const seq = Number(input?.seq);
  const items = sanitizeItems(input?.items);
  if (!phone || !token || !Number.isSafeInteger(seq) || seq <= 0 || !items.length) {
    return { invalid: true };
  }

  await connectDB();
  const now = new Date();
  const fields = {
    seq,
    name: clip(input.name, 200),
    district: clip(input.district, 100),
    address: clip(input.address, 500),
    items: JSON.stringify(items),
    totalPrice: toAmount(input.totalPrice),
    shippingCharge: toAmount(input.shippingCharge),
    grandTotal: toAmount(input.grandTotal),
    progress: Math.min(100, toAmount(input.progress)),
    lastActivityAt: now,
  };

  const updated = await CheckoutSession.updateOne(
    { phone, token, status: 'active', seq: { $lt: seq } },
    { $set: fields },
  );

  if (updated.matchedCount === 0) {
    // Either a first save or a new attempt on a known phone. A same-token
    // record that is completed or newer cannot match this filter, so the
    // upsert tries to insert and the unique phone index rejects it.
    try {
      await CheckoutSession.updateOne(
        { phone, token: { $ne: token } },
        {
          $set: {
            ...fields,
            token,
            status: 'active',
            startedAt: now,
            completedAt: null,
            orderId: null,
          },
        },
        { upsert: true },
      );
    } catch (error) {
      if (error.code === DUPLICATE_KEY) return { saved: false };
      throw error;
    }
  }

  // The customer corrected their number: drop the record for the old one so
  // it can't be reported as abandoned.
  await CheckoutSession.deleteMany({
    token,
    phone: { $ne: phone },
    status: 'active',
    seq: { $lt: seq },
  });

  return { saved: true };
}

/** Upserts, so a late progressive save can't create an active record either. */
export async function markCheckoutCompleted({ phone: rawPhone, token: rawToken, orderId }) {
  const phone = normalizePhone(rawPhone) || String(rawPhone);
  const token = clip(rawToken, 64);

  await connectDB();
  const now = new Date();
  const update = {
    $set: { status: 'completed', completedAt: now, orderId, lastActivityAt: now },
    $setOnInsert: { startedAt: now },
  };
  if (token) update.$set.token = token;
  else update.$setOnInsert.token = `order:${orderId}`;

  const write = () => CheckoutSession.updateOne({ phone }, update, { upsert: true });
  try {
    await write();
  } catch {
    // Most often two concurrent upserts colliding on the unique phone index.
    await write();
  }

  if (token) {
    await CheckoutSession.deleteMany({
      token,
      phone: { $ne: phone },
      status: 'active',
    });
  }
}

/**
 * Abandoned means: still active, and no activity for the inactivity threshold.
 * Worked out at query time so it needs no scheduled job.
 */
export function abandonedCheckoutFilter(now = new Date()) {
  return {
    status: 'active',
    lastActivityAt: { $lte: new Date(now.getTime() - ABANDONED_AFTER_MS) },
  };
}

export function getAbandonedAt(session) {
  return new Date(new Date(session.lastActivityAt).getTime() + ABANDONED_AFTER_MS);
}

/**
 * Counts checkouts that became abandoned since the admin last opened the page.
 * Uses a single "seen" timestamp, so clearing the counter never touches the
 * checkout records themselves.
 */
export async function countNewAbandonedCheckouts() {
  await connectDB();
  const state = await AdminState.findOne({ key: ABANDONED_SEEN_KEY }).lean();
  const filter = abandonedCheckoutFilter();
  if (state?.seenAt) {
    filter.lastActivityAt.$gt = new Date(state.seenAt.getTime() - ABANDONED_AFTER_MS);
  }
  return CheckoutSession.countDocuments(filter);
}

export async function markAbandonedCheckoutsSeen() {
  await connectDB();
  try {
    await AdminState.updateOne(
      { key: ABANDONED_SEEN_KEY },
      { $max: { seenAt: new Date() } },
      { upsert: true },
    );
  } catch (error) {
    // A concurrent first visit already created it, which is just as good.
    if (error.code !== DUPLICATE_KEY) throw error;
  }
}
