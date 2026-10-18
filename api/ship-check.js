const { keys } = require('./_shared');
const { delhiveryOn, serviceable } = require('./_delhivery');
const { deskOn } = require('./_orderdesk');
const { toDesk } = require('./verify');

// Troubleshooting. Re-sends one PAID Razorpay order to the Order Desk and shows the answer,
// plus whether the Delhivery token (used for Cash on Delivery) works.
//   /api/ship-check                      -> the most recent paid Fair N Pink order
//   /api/ship-check?order=order_XXXX     -> that order
// Safe to repeat: the Order Desk keeps one entry per order number. Books nothing with a courier. Shows no customer details or secrets.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const pickup = process.env.DELHIVERY_PICKUP || '';
  const delhivery = { on: delhiveryOn(), env: process.env.DELHIVERY_ENV === 'staging' ? 'staging' : 'live', pickupNames: pickup.split('|').filter((x) => x.trim()).length };
  if (delhivery.on) {
    try { const s = await serviceable('682030'); delhivery.tokenWorks = s.known; delhivery.sample = { pin: '682030', cod: s.cod, prepaid: s.prepaid }; }
    catch (e) { delhivery.tokenWorks = false; }
  }
  const k = keys();
  if (!k || !deskOn()) return res.status(503).json({ error: 'not_configured', razorpay: !!k, orderdesk: deskOn(), delhivery });
  const auth = { Authorization: 'Basic ' + Buffer.from(k.id + ':' + k.secret).toString('base64') };
  const asked = String((req.query && req.query.order) || '').trim();
  try {
    let o;
    if (/^order_[A-Za-z0-9]{6,40}$/.test(asked)) {
      const r = await fetch('https://api.razorpay.com/v1/orders/' + asked, { headers: auth });
      o = await r.json();
      if (!r.ok) return res.status(404).json({ error: 'razorpay_order_not_found', delhivery });
    } else {
      const r = await fetch('https://api.razorpay.com/v1/orders?count=25', { headers: auth });
      const d = await r.json();
      if (!r.ok) return res.status(502).json({ error: 'razorpay_list_failed', http: r.status, delhivery });
      o = (d.items || []).find((x) => x.status === 'paid' && x.notes && /Fair N Pink/i.test(String(x.notes.product || '')));
      if (!o) return res.status(404).json({ error: 'no_paid_fair_n_pink_order_found_in_last_25', delhivery });
    }
    if (o.status !== 'paid') return res.status(400).json({ error: 'order_not_paid', razorpay_status: o.status, order: o.id, delhivery });
    const rp = await fetch('https://api.razorpay.com/v1/orders/' + o.id + '/payments', { headers: auth });
    const pd = await rp.json();
    const p = ((pd && pd.items) || []).find((x) => x.status === 'captured' || x.status === 'authorized');
    if (!p) return res.status(400).json({ error: 'no_captured_payment', order: o.id, delhivery });
    const out = await toDesk(o, p);
    return res.status(200).json({ order: o.id, status: out && out.ok ? (out.duplicate ? 'already_in_order_desk' : 'sent_to_order_desk') : 'failed', reason: out && out.error, delhivery });
  } catch (e) {
    return res.status(200).json({ status: 'failed', reason: e.message, delhivery });
  }
};
