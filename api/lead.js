const { body, clean } = require('./_shared');
const { pushLead } = require('./_orderdesk');

// POST /api/lead — checkout lead: the shopper ticked the WhatsApp consent box. The details go to the Order Desk
// so the owner can message them herself later. The page ignores the answer, so this never breaks checkout.
const perPhone = new Map(); // phone -> timestamps (best effort: memory is per serverless instance)
let all = [];
const HOUR = 3600 * 1000;

function allowed(phone) {
  const now = Date.now();
  all = all.filter((t) => now - t < HOUR);
  if (all.length >= 200) return false;
  const mine = (perPhone.get(phone) || []).filter((t) => now - t < HOUR);
  if (mine.length >= 5) { perPhone.set(phone, mine); return false; }
  mine.push(now); perPhone.set(phone, mine); all.push(now);
  if (perPhone.size > 500) for (const [k, v] of perPhone) if (!v.some((t) => now - t < HOUR)) perPhone.delete(k);
  return true;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const b = body(req);
  const phone = String(b.phone || '').replace(/\D/g, '').slice(-10);
  if (b.consent !== true || !/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ error: 'invalid' });
  if (!allowed(phone)) return res.status(429).json({ error: 'slow_down' });
  try {
    await pushLead({ phone, name: clean(b.name, 80), product: clean(b.product, 120) });
  } catch (e) { /* never break checkout */ }
  return res.status(200).json({ ok: true });
};
