// Delhivery B2C API: pincode serviceability, Cash on Delivery shipment (waybill) booking and tracking.
// Switched on by DELHIVERY_TOKEN and DELHIVERY_PICKUP (the pickup / warehouse name exactly as registered in Delhivery).
// DELHIVERY_PICKUP may list several names separated by "|", e.g. "mohammed nihal|Beauty Mart"; each is tried in turn.
// Optional: DELHIVERY_ENV=staging, DELHIVERY_MODE (Surface or Express, default Surface).
const { BOX, PRODUCT } = require('./_shared');

const base = () => (process.env.DELHIVERY_ENV === 'staging' ? 'https://staging-express.delhivery.com' : 'https://track.delhivery.com');
const token = () => process.env.DELHIVERY_TOKEN || '';
const pickup = () => (process.env.DELHIVERY_PICKUP || '').split('|')[0].trim();
const delhiveryOn = () => Boolean(token() && pickup());
const trackUrl = (awb) => 'https://www.delhivery.com/track/package/' + encodeURIComponent(awb);

// Each pickup name is also tried in a few spellings. A name Delhivery does not recognise books nothing, so trying them is safe.
function pickupNames() {
  const raw = (process.env.DELHIVERY_PICKUP || '').split('|').map((x) => x.trim()).filter(Boolean);
  const out = [];
  const add = (n) => { if (n && !out.includes(n)) out.push(n); };
  raw.forEach((n) => { add(n); add(n.toUpperCase()); add(n.toLowerCase()); add(n.replace(/\b\w/g, (ch) => ch.toUpperCase())); add(n + ' '); });
  return out.slice(0, 12);
}

// Seller and return address.
const RETURN = { name: 'Beauty Mart', add: 'Azad Nagar 4th Cross, Bhatkal', city: 'Bhatkal', state: 'Karnataka', pin: '581320', phone: '9980881230' };

async function serviceable(pin) {
  const r = await fetch(base() + '/c/api/pin-codes/json/?filter_codes=' + encodeURIComponent(pin), { headers: { Authorization: 'Token ' + token(), Accept: 'application/json' } });
  const j = await r.json().catch(() => ({}));
  const pc = j && j.delivery_codes && j.delivery_codes[0] && j.delivery_codes[0].postal_code;
  if (!pc) return { known: false, cod: false, prepaid: false };
  return { known: true, cod: String(pc.cod).toUpperCase() === 'Y', prepaid: String(pc.pre_paid).toUpperCase() === 'Y', city: pc.city || '', state: pc.state_code || '' };
}

// c: { name, phone, address, city, state, pincode }; q: { packNumber, total } from quote(); pay: 'cod' | 'prepaid'.
async function createShipment({ ref, c, q, pay }) {
  const cod = pay === 'cod';
  const shipment = {
    name: c.name, add: c.address, pin: c.pincode, city: c.city, state: c.state, country: 'India',
    phone: c.phone, order: ref, payment_mode: cod ? 'COD' : 'Prepaid', cod_amount: cod ? String(q.total) : '0', total_amount: String(q.total),
    products_desc: (PRODUCT + ', Pack of ' + q.packNumber).slice(0, 200), quantity: String(q.packNumber),
    order_date: new Date().toISOString().slice(0, 19).replace('T', ' '), weight: String(BOX.grams),
    shipment_length: String(BOX.length), shipment_width: String(BOX.breadth), shipment_height: String(BOX.height),
    seller_name: 'Beauty Mart', seller_add: RETURN.add, return_name: RETURN.name, return_add: RETURN.add, return_city: RETURN.city, return_state: RETURN.state,
    return_pin: RETURN.pin, return_country: 'India', return_phone: RETURN.phone, shipping_mode: process.env.DELHIVERY_MODE || 'Surface', address_type: 'home', waybill: ''
  };
  let last = '';
  for (const name of pickupNames()) {
    const data = { shipments: [shipment], pickup_location: { name } };
    const r = await fetch(base() + '/api/cmu/create.json', {
      method: 'POST', headers: { Authorization: 'Token ' + token(), Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'format=json&data=' + encodeURIComponent(JSON.stringify(data))
    });
    const j = await r.json().catch(() => ({}));
    const pkg = j && Array.isArray(j.packages) && j.packages[0];
    if (r.ok && pkg && pkg.waybill && String(pkg.status).toLowerCase() === 'success') return { ok: true, awb: String(pkg.waybill), pickup: name };
    last = String((pkg && (Array.isArray(pkg.remarks) ? pkg.remarks.join('; ') : pkg.remarks)) || j.rmk || j.error || ('HTTP ' + r.status));
    if (!/ClientWarehouse|warehouse|pickup/i.test(last)) break; // a different problem: another name will not help
  }
  return { ok: false, error: (last + ' (pickup names tried: ' + pickupNames().map((n) => JSON.stringify(n)).join(', ') + ')').slice(0, 400) };
}

// Tracking for a Delhivery waybill, in the same customer-safe shape the Track order page already shows.
// If the lookup fails, the Delhivery tracking link is still returned.
async function track(awb) {
  const link = { found: true, shipped: true, status: 'Shipped', courier: 'Delhivery', awb, expected: '', delivered_on: '', track_url: trackUrl(awb), events: [] };
  if (!token()) return link;
  try {
    const r = await fetch(base() + '/api/v1/packages/json/?waybill=' + encodeURIComponent(awb), { headers: { Authorization: 'Token ' + token(), Accept: 'application/json' } });
    const j = await r.json().catch(() => null);
    const s = j && Array.isArray(j.ShipmentData) && j.ShipmentData[0] && j.ShipmentData[0].Shipment;
    if (!r.ok || !s) return { found: false, reason: 'unknown_awb', link };
    const st = s.Status || {};
    const scans = Array.isArray(s.Scans) ? s.Scans.map((x) => x.ScanDetail || {}).reverse() : [];
    const status = String(st.Status || '').trim();
    return Object.assign(link, {
      status: status || 'Shipped',
      expected: String(s.ExpectedDeliveryDate || s.PromisedDeliveryDate || '').trim(),
      delivered_on: /deliver/i.test(status) && !/un|not/i.test(status) ? String(st.StatusDateTime || '').trim() : '',
      events: scans.slice(0, 12).map((x) => ({ date: String(x.ScanDateTime || ''), text: String(x.Instructions || x.Scan || ''), place: String(x.ScannedLocation || '') }))
    });
  } catch (e) {
    return link;
  }
}

module.exports = { delhiveryOn, serviceable, createShipment, track, trackUrl };
