const crypto = require('crypto');
const { keys } = require('./_shared');

// Confirms that a payment reported by the browser was really signed by Razorpay.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const k = keys();
  if (!k) return res.status(503).json({ error: 'not_configured' });

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const orderId = String(body.razorpay_order_id || '');
  const paymentId = String(body.razorpay_payment_id || '');
  const signature = String(body.razorpay_signature || '');
  if (!orderId || !paymentId || !signature) return res.status(400).json({ ok: false });

  const expected = crypto.createHmac('sha256', k.secret).update(orderId + '|' + paymentId).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  return res.status(ok ? 200 : 400).json({ ok });
};
