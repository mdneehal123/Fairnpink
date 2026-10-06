const { keys, shipArgs } = require('./_shared');
const shiprocket = require('./_shiprocket');

// Troubleshooting. Re-sends one PAID Razorpay order to Shiprocket and shows Shiprocket's answer.
//   /api/ship-check                      -> the most recent paid Fair N Pink order
//   /api/ship-check?order=order_XXXX     -> that order
// Safe to repeat: the same order id never creates a second shipment. Shows no customer details.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const k = keys();
  if (!k || !shiprocket.settings()) return res.status(503).json({ error: 'not_configured' });
  const auth = { Authorization: 'Basic ' + Buffer.from(k.id + ':' + k.secret).toString('base64') };
  const asked = String((req.query && req.query.order) || '').trim();
  try {
    let o;
    if (/^order_[A-Za-z0-9]{6,40}$/.test(asked)) {
      const r = await fetch('https://api.razorpay.com/v1/orders/' + asked, { headers: auth });
      o = await r.json();
      if (!r.ok) return res.status(404).json({ error: 'razorpay_order_not_found' });
    } else {
      const r = await fetch('https://api.razorpay.com/v1/orders?count=25', { headers: auth });
      const d = await r.json();
      if (!r.ok) return res.status(502).json({ error: 'razorpay_list_failed', http: r.status });
      o = (d.items || []).find((x) => x.status === 'paid' && x.notes && /Fair N Pink/i.test(String(x.notes.product || '')));
      if (!o) return res.status(404).json({ error: 'no_paid_fair_n_pink_order_found_in_last_25' });
    }
    if (o.status !== 'paid') return res.status(400).json({ error: 'order_not_paid', razorpay_status: o.status, order: o.id });
    const args = shipArgs(o);
    if (!args) return res.status(400).json({ error: 'order_has_no_delivery_details', order: o.id });
    const out = await shiprocket.createOrder(args);
    return res.status(200).json(Object.assign({ order: o.id }, out));
  } catch (e) {
    return res.status(200).json({ status: 'failed', reason: e.message, detail: e.detail });
  }
};
