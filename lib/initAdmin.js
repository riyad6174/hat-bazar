import bcrypt from 'bcryptjs';
import Admin from '@/models/Admin';

let _ensured = false;

export async function ensureDefaultAdmin() {
  if (_ensured) return;

  try {
    const count = await Admin.estimatedDocumentCount();
    if (count === 0) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'hatbazar123', 12);
      await Admin.create({ email: process.env.ADMIN_EMAIL || 'admin@hatbazar.com', password: hash });
      console.log('[Init] Default admin created');
    }
    _ensured = true;
  } catch (err) {
    console.warn('[Init] ensureDefaultAdmin error:', err.message);
  }
}
