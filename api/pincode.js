const shiprocket = require('./_shiprocket');

// Looks up a delivery pincode: city, state and the courier's estimated number of days.
// Used only to help the customer fill the form. Any failure returns { ok: false } and the form carries on as before.
module.exports = async (req, res) => {
  const pin = String((req.query && req.query.pin) || '').trim();
  if (!/^[1-9]\d{5}$/.test(pin)) { res.setHeader('Cache-Control', 'no-store'); return res.status(400).json({ ok: false }); }
  try {
    const out = await shiprocket.pincode(pin);
    // The same pincode gives the same answer for everyone, so let the CDN keep it for half a day.
    res.setHeader('Cache-Control', out.ok ? 'public, s-maxage=43200, max-age=3600' : 'no-store');
    return res.status(200).json(out);
  } catch (e) {
    console.error('pincode lookup failed', e && e.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: false });
  }
};
