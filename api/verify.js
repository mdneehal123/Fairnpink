const crypto = require('crypto');
const { keys, body, customer, quote, cleanRef, PACKS } = require('./_shared');
const { pushToDesk, deskOn } = require('./_orderdesk');

// Confirms that a payment reported by the browser was really made: Razorpay's signature, then the payment itself
// (captured or authorized, for this order, for the server price). The paid order then goes into the Order Desk.
// Paid orders are NOT booked with a courier here; they are shipped from the Order Desk.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const k = keys();
  if (!k) return res.status(503).json({ error: 'not_configured' });

  const b = body(req);
  const orderId = String(b.razorpay_order_id || '');
  const paymentId = String(b.razorpay_payment_id || '');
  const signature = String(b.razorpay_signature || '');
  if (!orderId || !paymentId || !signature) return res.status(400).json({ ok: false });

  const expected = crypto.createHmac('sha256', k.secret).update(orderId + '|' + paymentId).digest('hex');
  const x = Buffer.from(expected);
  const y = Buffer.from(signature);
  if (!(x.length === y.length && crypto.timingSafeEqual(x, y))) return res.status(400).json({ ok: false });

  const auth = { Authorization: 'Basic ' + Buffer.from(k.id + ':' + k.secret).toString('base64') };
  let p, o;
  try {
    // Read the payment and the order back from Razorpay, so the amount and address cannot be altered by the browser.
    const [rp, ro] = await Promise.all([
      fetch('https://api.razorpay.com/v1/payments/' + encodeURIComponent(paymentId), { headers: auth }),
      fetch('https://api.razorpay.com/v1/orders/' + encodeURIComponent(orderId), { headers: auth })
    ]);
    p = await rp.json();
    o = await ro.json();
    if (!rp.ok || !ro.ok) throw new Error('lookup_failed');
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'lookup_failed' });
  }
  if (p.order_id !== orderId || !(p.status === 'captured' || p.status === 'authorized')) return res.status(400).json({ ok: false, status: p.status });

  // A problem saving the order must never turn a successful payment into an error for the customer.
  let shipping = deskOn() ? 'failed' : 'off';
  try {
    const out = await toDesk(o, p);
    if (out) shipping = out.ok ? 'orderdesk' : 'failed';
    if (out && !out.ok) console.error('order desk hand-off failed', out.error);
  } catch (e) {
    console.error('order desk hand-off failed', e && e.message);
  }
  return res.status(200).json({ ok: true, shipping });
};

// Builds the Order Desk entry from the Razorpay order notes (written by create-order) and the payment.
async function toDesk(o, p) {
  if (!deskOn()) return null;
  const n = (o && o.notes) || {};
  const packNumber = Number(String(n.pack || '').replace(/\D/g, ''));
  const c = customer(n);
  const ref = cleanRef(n.ref) || cleanRef('FP' + String(o.id || '').replace(/^order_/, ''));
  const paidRs = Math.round(Number(p.amount) / 100);
  if (n.mode === 'advance') {
    // An order started before the switch, when Cash on Delivery needed a small advance paid online; the rest is due at the door.
    const q = quote(packNumber, false);
    if (!q || !c) return { ok: false, error: 'order_has_no_delivery_details' };
    q.disc = paidRs; q.total = Math.max(0, PACKS[packNumber].price - paidRs);
    return pushToDesk({ ref, c, q, pay: 'cod', paid: false, payId: p.id,
      note: '⚠ Old-style COD order: Rs ' + paidRs + ' advance paid online (' + p.id + '). Collect Rs ' + q.total + ' on delivery. Please book the courier.' });
  }
  const q = quote(packNumber, true);
  if (!q || !c) return { ok: false, error: 'order_has_no_delivery_details' };
  const match = q.total === paidRs;
  q.total = paidRs; // the amount actually charged
  return pushToDesk({ ref, c, q, pay: 'upi', paid: true, payId: p.id,
    note: 'Paid online via Razorpay (' + (p.method || 'online') + ') ' + p.id + (match ? '' : ' ⚠ amount Rs ' + paidRs + ' differs from the pack price') });
}

module.exports.toDesk = toDesk;
