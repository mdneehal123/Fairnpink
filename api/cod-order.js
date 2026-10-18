const { body, customer, quote, newRef, cleanRef } = require('./_shared');
const { delhiveryOn, serviceable, createShipment, trackUrl } = require('./_delhivery');
const { pushToDesk, deskOn } = require('./_orderdesk');

// POST /api/cod-order — Cash on Delivery, nothing paid upfront.
// Price from the server table -> Delhivery pincode check (409 if Cash on Delivery is not available there)
// -> Delhivery shipment booked for the pack price -> the order is ALWAYS saved in the Order Desk
// (booked: with the AWB, label printed from the Delhivery panel; not booked: flagged for manual booking).
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const b = body(req);
  if (b.website) return res.status(200).json({ ok: true }); // spam trap
  const q = quote(b.pack, false);
  const c = customer(b);
  if (!q || !c) return res.status(400).json({ error: 'invalid_details' });
  const ref = cleanRef(b.ref) || newRef();

  // Neither Delhivery nor the Order Desk switched on: the page sends the order on WhatsApp instead.
  if (!delhiveryOn() && !deskOn()) return res.status(503).json({ error: 'not_configured' });

  let d = { ok: false, error: 'Delhivery is not switched on (DELHIVERY_TOKEN / DELHIVERY_PICKUP missing)' };
  if (delhiveryOn()) {
    try {
      const s = await serviceable(c.pincode);
      if (s.known && !s.cod) return res.status(409).json({ error: 'cod_unavailable', codUnavailable: true, message: 'Cash on Delivery is not available for pincode ' + c.pincode + '. Please pay online instead.' });
      if (!c.state && s.state) c.state = s.state;
    } catch (e) { /* if the check fails, still try to book */ }
    try { d = await createShipment({ ref, c, q, pay: 'cod' }); } catch (e) { d = { ok: false, error: String((e && e.message) || e) }; }
  }

  const desk = await pushToDesk(d.ok
    ? { ref, c, q, pay: 'cod', paid: false, courier: 'Delhivery', awb: d.awb, note: 'COD booked with Delhivery · AWB ' + d.awb + ' · print the label from the Delhivery panel' }
    : { ref, c, q, pay: 'cod', paid: false, note: '⚠ COD website order — Delhivery booking failed: ' + d.error + '. Please book it in Delhivery.' });
  if (!desk.ok) console.error('order desk hand-off failed', ref, desk.error);
  if (!d.ok) console.error('delhivery booking failed', ref, d.error);

  if (d.ok) return res.status(200).json({ ok: true, ref, awb: d.awb, courier: 'Delhivery', total: q.total, savedToDesk: desk.ok, trackUrl: trackUrl(d.awb) });
  // Not booked and not saved anywhere: tell the page, so the customer sends it on WhatsApp and the order is not lost.
  if (!desk.ok) return res.status(502).json({ error: 'not_saved', ref });
  return res.status(200).json({ ok: true, ref, awb: '', courier: '', total: q.total, pending: true, savedToDesk: true });
};
