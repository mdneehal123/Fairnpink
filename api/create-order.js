const { keys, body, customer, quote, newRef, PRODUCT } = require('./_shared');

// Starts a full online payment (Razorpay). The amount comes from the server price table, never from the browser.
// Cash on Delivery does not come here: it is booked by /api/cod-order with nothing paid upfront.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const k = keys();
  if (!k) return res.status(503).json({ error: 'not_configured' });

  const b = body(req);
  const q = quote(b.pack, true);
  const c = customer(b);
  if (!q || !c) return res.status(400).json({ error: 'invalid_details' });
  const ref = newRef();
  try {
    const r = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(k.id + ':' + k.secret).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: q.total * 100,
        currency: 'INR',
        receipt: ref,
        notes: { product: PRODUCT, pack: 'Pack of ' + q.packNumber, name: c.name, phone: c.phone, address: c.address, city: c.city, pincode: c.pincode,
          mode: 'full', ref, payment: 'Paid in full online' }
      })
    });
    const data = await r.json();
    if (!r.ok || !data.id) return res.status(502).json({ error: 'gateway_error' });
    return res.status(200).json({ order_id: data.id, amount: data.amount, currency: data.currency, key_id: k.id, ref, total: q.total });
  } catch (e) {
    return res.status(502).json({ error: 'gateway_unreachable' });
  }
};
