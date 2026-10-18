const shiprocket = require('./_shiprocket');
const { delhiveryOn, serviceable } = require('./_delhivery');
const { stateFor } = require('./_shared');

// Looks up a delivery pincode: city, state, the estimated number of delivery days and whether
// Cash on Delivery is available there (Delhivery, which delivers Cash on Delivery orders).
// Response: { ok, city, state, days, cod } where cod is true, false or absent when unknown.
// Used only to help the customer fill the form. Any failure returns { ok: false } and the form carries on as before.
const nice = (v) => String(v || '').trim().toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()).slice(0, 60);

module.exports = async (req, res) => {
  const pin = String((req.query && req.query.pin) || '').trim();
  if (!/^[1-9]\d{5}$/.test(pin)) { res.setHeader('Cache-Control', 'no-store'); return res.status(400).json({ ok: false }); }
  const [sr, dl] = await Promise.all([
    shiprocket.settings() ? shiprocket.pincode(pin).catch((e) => { console.error('pincode lookup failed', e && e.message); return { ok: false }; }) : Promise.resolve({ ok: false }),
    delhiveryOn() ? serviceable(pin).catch(() => null) : Promise.resolve(null)
  ]);
  const out = sr && sr.ok ? { ok: true, city: sr.city, state: sr.state, days: sr.days } : { ok: false };
  if (dl && dl.known) {
    if (!out.ok) Object.assign(out, { ok: true, city: nice(dl.city), state: stateFor(pin), days: 0 });
    out.cod = dl.cod;
  }
  // The same pincode gives the same answer for everyone, so let the CDN keep it for half a day.
  res.setHeader('Cache-Control', out.ok ? 'public, s-maxage=43200, max-age=3600' : 'no-store');
  return res.status(200).json(out);
};
