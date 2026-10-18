const { keys, PACKS } = require('./_shared');
const shiprocket = require('./_shiprocket');
const delhivery = require('./_delhivery');

// Order tracking for customers. Accepts a Payment ID (pay_...), an Order ID (order_...) or a courier AWB
// (Delhivery for Cash on Delivery orders, Shiprocket for older orders).
// Returns status only: never a name, phone number or address.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const q = req.query || {};
  const id = String(q.id || '').trim();
  const phone = String(q.phone || '').replace(/\D/g, '').slice(-10);
  const pin = String(q.pin || '').trim();
  const byPhone = !id && (q.phone || q.pin);
  if (byPhone && (!/^[6-9]\d{9}$/.test(phone) || !/^[1-9]\d{5}$/.test(pin))) return res.status(400).json({ error: 'bad_phone' });
  if (!byPhone && (!id || id.length > 60)) return res.status(400).json({ error: 'missing_id' });
  // A courier tracking number: Delhivery (Cash on Delivery orders) or an older Shiprocket shipment.
  if (!byPhone && !/^(pay|order)_/.test(id) && /^[A-Za-z0-9]{8,30}$/.test(id)) {
    try {
      if (shiprocket.settings()) {
        const t = await shiprocket.track('awb', id).catch(() => ({ found: false }));
        if (t.found) return res.status(200).json(t);
      }
      if (!/^\d{10,16}$/.test(id)) return res.status(404).json({ error: 'not_found' });
      const d = await delhivery.track(id);
      if (!d.found) return res.status(404).json({ error: 'not_found' });
      return res.status(200).json(d);
    } catch (e) {
      return res.status(502).json({ error: 'lookup_failed' });
    }
  }
  const k = keys();
  if (!k) return res.status(503).json({ error: 'not_configured' });
  const auth = { Authorization: 'Basic ' + Buffer.from(k.id + ':' + k.secret).toString('base64') };
  try {
    let orderId = '';
    let paid = null;
    if (byPhone) {
      // Mobile number and delivery pincode must both match the order, so a number alone shows nothing.
      const since = Math.floor(Date.now() / 1000) - 90 * 86400;
      let hit = null, more = 0;
      for (let skip = 0; skip < 1000; skip += 100) {
        const r = await fetch('https://api.razorpay.com/v1/orders?count=100&skip=' + skip + '&from=' + since, { headers: auth });
        const d = await r.json();
        if (!r.ok) return res.status(502).json({ error: 'lookup_failed' });
        const items = d.items || [];
        items.forEach((o) => {
          const n = o.notes || {};
          if (o.status !== 'paid' || !/Fair N Pink/i.test(String(n.product || ''))) return;
          if (String(n.phone || '').replace(/\D/g, '').slice(-10) !== phone || String(n.pincode || '').trim() !== pin) return;
          if (!hit || o.created_at > hit.created_at) { if (hit) more++; hit = o; } else { more++; }
        });
        if (items.length < 100) break;
      }
      if (!hit) return res.status(404).json({ error: 'not_found' });
      orderId = hit.id;
      res.setHeader('X-Other-Orders', String(more));
    } else if (/^pay_[A-Za-z0-9]{6,40}$/.test(id)) {
      const r = await fetch('https://api.razorpay.com/v1/payments/' + id, { headers: auth });
      const p = await r.json();
      if (!r.ok || !p.order_id) return res.status(404).json({ error: 'not_found' });
      orderId = p.order_id;
    } else if (/^order_[A-Za-z0-9]{6,40}$/.test(id)) {
      orderId = id;
    } else {
      return res.status(400).json({ error: 'bad_id' });
    }
    const r = await fetch('https://api.razorpay.com/v1/orders/' + orderId, { headers: auth });
    const o = await r.json();
    if (!r.ok) return res.status(404).json({ error: 'not_found' });
    paid = o.status === 'paid';
    const pack = String((o.notes && o.notes.pack) || '');
    const pk = PACKS[Number(pack.replace(/\D/g, ''))];
    // Older Cash on Delivery orders had a small advance paid online; the rest is due at the door.
    const due = o.notes && o.notes.mode === 'advance' && pk ? Math.max(0, pk.price - Math.round(Number(o.amount_paid || o.amount) / 100)) : 0;
    const placed = o.created_at ? new Date(o.created_at * 1000).toISOString() : '';
    if (!paid) return res.status(200).json({ found: true, paid: false, pack, placed, due });
    const t = shiprocket.settings() ? await shiprocket.track('order', orderId).catch(() => ({ found: false })) : { found: false };
    const others = Number(res.getHeader && res.getHeader('X-Other-Orders')) || 0;
    return res.status(200).json(Object.assign({ paid: true, pack, placed, due, others }, t.found ? t : { found: true, shipped: false }));
  } catch (e) {
    return res.status(502).json({ error: 'lookup_failed' });
  }
};
