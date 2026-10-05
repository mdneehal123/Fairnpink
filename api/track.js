const { keys } = require('./_shared');
const shiprocket = require('./_shiprocket');

// Order tracking for customers. Accepts a Payment ID (pay_...), an Order ID (order_...) or a courier AWB.
// Returns status only: never a name, phone number or address.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const id = String((req.query && req.query.id) || '').trim();
  if (!id || id.length > 60) return res.status(400).json({ error: 'missing_id' });
  const k = keys();
  if (!k || !shiprocket.settings()) return res.status(503).json({ error: 'not_configured' });
  const auth = { Authorization: 'Basic ' + Buffer.from(k.id + ':' + k.secret).toString('base64') };
  try {
    let orderId = '';
    let paid = null;
    if (/^pay_[A-Za-z0-9]{6,40}$/.test(id)) {
      const r = await fetch('https://api.razorpay.com/v1/payments/' + id, { headers: auth });
      const p = await r.json();
      if (!r.ok || !p.order_id) return res.status(404).json({ error: 'not_found' });
      orderId = p.order_id;
    } else if (/^order_[A-Za-z0-9]{6,40}$/.test(id)) {
      orderId = id;
    } else if (/^[A-Za-z0-9]{8,30}$/.test(id)) {
      const t = await shiprocket.track('awb', id);
      if (!t.found) return res.status(404).json({ error: 'not_found' });
      return res.status(200).json(t);
    } else {
      return res.status(400).json({ error: 'bad_id' });
    }
    const r = await fetch('https://api.razorpay.com/v1/orders/' + orderId, { headers: auth });
    const o = await r.json();
    if (!r.ok) return res.status(404).json({ error: 'not_found' });
    paid = o.status === 'paid';
    const pack = String((o.notes && o.notes.pack) || '');
    const placed = o.created_at ? new Date(o.created_at * 1000).toISOString() : '';
    if (!paid) return res.status(200).json({ found: true, paid: false, pack, placed });
    const t = await shiprocket.track('order', orderId);
    return res.status(200).json(Object.assign({ paid: true, pack, placed }, t.found ? t : { found: true, shipped: false }));
  } catch (e) {
    return res.status(502).json({ error: 'lookup_failed' });
  }
};
