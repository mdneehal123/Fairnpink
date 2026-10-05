const { keys } = require('./_shared');
const shiprocket = require('./_shiprocket');

// Troubleshooting: /api/ship-check?order=order_XXXX re-sends one PAID Razorpay order to Shiprocket
// and shows Shiprocket's answer. Safe to repeat: the same order id never creates a second shipment.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const k = keys();
  if (!k || !shiprocket.settings()) return res.status(503).json({ error: 'not_configured' });
  const orderId = String((req.query && req.query.order) || '');
  if (!/^order_[A-Za-z0-9]{6,40}$/.test(orderId)) return res.status(400).json({ error: 'give ?order=order_XXXX from Razorpay' });
  try {
    const r = await fetch('https://api.razorpay.com/v1/orders/' + orderId, {
      headers: { Authorization: 'Basic ' + Buffer.from(k.id + ':' + k.secret).toString('base64') }
    });
    const o = await r.json();
    if (!r.ok) return res.status(404).json({ error: 'razorpay_order_not_found' });
    if (o.status !== 'paid') return res.status(400).json({ error: 'order_not_paid', razorpay_status: o.status });
    const n = o.notes || {};
    const out = await shiprocket.createOrder({
      id: orderId, packNumber: Number(String(n.pack || '').replace(/\D/g, '')), amountRupees: Math.round(Number(o.amount) / 100),
      name: n.name, phone: n.phone, address: n.address, city: n.city, pincode: n.pincode
    });
    return res.status(200).json(out);
  } catch (e) {
    return res.status(200).json({ status: 'failed', reason: e.message, detail: e.detail });
  }
};
