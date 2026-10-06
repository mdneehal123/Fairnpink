const { PACKS, ADVANCE, keys, clean } = require('./_shared');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const k = keys();
  if (!k) return res.status(503).json({ error: 'not_configured' });

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const pack = PACKS[Number(body.pack)];
  const name = clean(body.name, 80);
  const phone = clean(body.phone, 20);
  const address = clean(body.address, 250);
  const city = clean(body.city, 60);
  const pincode = clean(body.pincode, 6);
  if (!pack || name.length < 2 || !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, '').slice(-10)) || address.length < 8 || city.length < 2 || !/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ error: 'invalid_details' });
  }

  // mode 'advance' = Cash on Delivery with a small advance paid now. Anything else = full payment online.
  const advance = body.mode === 'advance';
  const amount = (advance ? ADVANCE : pack.price - pack.off) * 100;
  const balance = advance ? pack.price - ADVANCE : 0;
  try {
    const r = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(k.id + ':' + k.secret).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: 'fnp_' + Date.now(),
        notes: { product: 'Fair N Pink Advance Radiance Cream', pack: 'Pack of ' + Number(body.pack), name, phone, address, city, pincode,
          mode: advance ? 'advance' : 'full', payment: advance ? 'Advance Rs ' + ADVANCE + ' paid, Rs ' + balance + ' cash on delivery' : 'Paid in full online' }
      })
    });
    const data = await r.json();
    if (!r.ok || !data.id) return res.status(502).json({ error: 'gateway_error' });
    return res.status(200).json({ order_id: data.id, amount: data.amount, currency: data.currency, key_id: k.id, balance });
  } catch (e) {
    return res.status(502).json({ error: 'gateway_unreachable' });
  }
};

function safeParse(text) {
  try { return JSON.parse(text); } catch (e) { return {}; }
}
