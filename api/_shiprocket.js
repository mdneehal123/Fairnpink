// Sends a paid order to Shiprocket so it appears under New Orders, ready to ship.
// Switched on by two environment variables: SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD
// (an API user, not the main login).
const BASE = 'https://apiv2.shiprocket.in/v1/external';

// Pickup address nickname in Shiprocket (Azad Nagar 4th Cross, Bhatkal 581320). Not a secret.
const PICKUP = 'Primary';

// Parcel sent to Shiprocket: 100 g in a 10 x 10 x 8 cm box for every pack, as confirmed by the owner.
const BOX = { weight: 0.1, length: 10, breadth: 10, height: 8 };
const PARCEL = { 1: BOX, 2: BOX, 3: BOX };

// Fallback when the pincode lookup is unavailable: first two digits of the pincode.
const STATE_BY_PREFIX = {
  11: 'Delhi', 12: 'Haryana', 13: 'Haryana', 14: 'Punjab', 15: 'Punjab', 16: 'Punjab', 17: 'Himachal Pradesh',
  18: 'Jammu and Kashmir', 19: 'Jammu and Kashmir', 20: 'Uttar Pradesh', 21: 'Uttar Pradesh', 22: 'Uttar Pradesh',
  23: 'Uttar Pradesh', 24: 'Uttar Pradesh', 25: 'Uttar Pradesh', 26: 'Uttarakhand', 27: 'Uttar Pradesh', 28: 'Uttar Pradesh',
  30: 'Rajasthan', 31: 'Rajasthan', 32: 'Rajasthan', 33: 'Rajasthan', 34: 'Rajasthan', 36: 'Gujarat', 37: 'Gujarat',
  38: 'Gujarat', 39: 'Gujarat', 40: 'Maharashtra', 41: 'Maharashtra', 42: 'Maharashtra', 43: 'Maharashtra', 44: 'Maharashtra',
  45: 'Madhya Pradesh', 46: 'Madhya Pradesh', 47: 'Madhya Pradesh', 48: 'Madhya Pradesh', 49: 'Chhattisgarh',
  50: 'Telangana', 51: 'Andhra Pradesh', 52: 'Andhra Pradesh', 53: 'Andhra Pradesh', 56: 'Karnataka', 57: 'Karnataka',
  58: 'Karnataka', 59: 'Karnataka', 60: 'Tamil Nadu', 61: 'Tamil Nadu', 62: 'Tamil Nadu', 63: 'Tamil Nadu', 64: 'Tamil Nadu',
  65: 'Tamil Nadu', 66: 'Tamil Nadu', 67: 'Kerala', 68: 'Kerala', 69: 'Kerala', 70: 'West Bengal', 71: 'West Bengal',
  72: 'West Bengal', 73: 'West Bengal', 74: 'West Bengal', 75: 'Odisha', 76: 'Odisha', 77: 'Odisha', 78: 'Assam',
  79: 'Assam', 80: 'Bihar', 81: 'Bihar', 82: 'Jharkhand', 83: 'Jharkhand', 84: 'Bihar', 85: 'Bihar'
};

function settings() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  return email && password ? { email, password, pickup: PICKUP } : null;
}

let cached = { token: '', until: 0 };

async function login(s) {
  if (cached.token && Date.now() < cached.until) return cached.token;
  const r = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: s.email, password: s.password })
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.token) {
    const e = new Error('shiprocket_login_failed');
    e.detail = { step: 'login', http: r.status, message: String(d.message || '').slice(0, 200) };
    throw e;
  }
  cached = { token: d.token, until: Date.now() + 8 * 24 * 3600 * 1000 };
  return d.token;
}

async function stateFor(pincode, token) {
  try {
    const r = await fetch(BASE + '/open/postcode/details?postcode=' + encodeURIComponent(pincode), {
      headers: { Authorization: 'Bearer ' + token }
    });
    const d = await r.json();
    const s = d && d.postcode_details && d.postcode_details.state;
    if (s) return String(s);
  } catch (e) { /* fall through to the prefix table */ }
  return STATE_BY_PREFIX[Number(String(pincode).slice(0, 2))] || '';
}

function stamp(date) {
  const ist = new Date(date.getTime() + 5.5 * 3600 * 1000);
  return ist.toISOString().slice(0, 16).replace('T', ' ');
}

// order: { id, packNumber, name, phone, address, city, pincode, cod, itemPrice, discount, collect }
// Prepaid: itemPrice is what was paid. Cash on Delivery with advance: itemPrice is the pack price,
// discount is the advance already paid, and the courier collects the difference.
async function createOrder(order) {
  const s = settings();
  if (!s) return { status: 'off' };
  const parcel = PARCEL[order.packNumber];
  if (!parcel) return { status: 'failed', reason: 'unknown_pack' };
  const token = await login(s);
  const state = await stateFor(order.pincode, token);
  const r = await fetch(BASE + '/orders/create/adhoc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      order_id: order.id,
      order_date: stamp(new Date()),
      pickup_location: s.pickup,
      billing_customer_name: order.name,
      billing_last_name: '',
      billing_address: order.address,
      billing_city: order.city,
      billing_pincode: order.pincode,
      billing_state: state,
      billing_country: 'India',
      billing_email: process.env.SHIPROCKET_ORDER_EMAIL || 'orders@fairnpink.in',
      billing_phone: String(order.phone).replace(/\D/g, '').slice(-10),
      shipping_is_billing: true,
      order_items: [{
        name: 'Fair N Pink Advance Radiance Cream, Pack of ' + order.packNumber,
        sku: 'FNP-ARC-P' + order.packNumber,
        units: 1,
        selling_price: order.itemPrice
      }],
      payment_method: order.cod ? 'COD' : 'Prepaid',
      total_discount: order.discount || 0,
      sub_total: order.cod ? order.collect : order.itemPrice,
      length: parcel.length,
      breadth: parcel.breadth,
      height: parcel.height,
      weight: parcel.weight
    })
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !(d.order_id || d.shipment_id)) {
    // Shiprocket names the valid pickup locations when the nickname is wrong.
    const list = d && d.data && Array.isArray(d.data.data) ? d.data.data.map((x) => x.pickup_location).filter(Boolean) : undefined;
    const detail = { step: 'create', http: r.status, message: String(d.message || '').slice(0, 300), errors: d.errors, pickup_sent: s.pickup, pickup_available: list, state_sent: state };
    console.error('shiprocket create failed', JSON.stringify(detail));
    return { status: 'failed', reason: 'shiprocket_rejected', detail };
  }
  return { status: 'created', shiprocket_order_id: d.order_id || null };
}

// Tracking. kind: 'order' (our order id) or 'awb'. Returns a small, customer-safe summary.
async function track(kind, value) {
  const s = settings();
  if (!s) return { found: false, reason: 'off' };
  const token = await login(s);
  const url = kind === 'awb'
    ? BASE + '/courier/track/awb/' + encodeURIComponent(value)
    : BASE + '/courier/track?order_id=' + encodeURIComponent(value);
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  const raw = await r.json().catch(() => null);
  if (!r.ok || !raw) return { found: false, reason: 'lookup_failed', http: r.status };
  // The two endpoints wrap the same data differently.
  let t = raw;
  if (Array.isArray(t)) t = t[0];
  if (t && !t.tracking_data) { const k = Object.keys(t)[0]; if (t[k] && t[k].tracking_data) t = t[k]; }
  const d = t && t.tracking_data;
  if (!d) return { found: false, reason: 'no_data' };
  const sh = (Array.isArray(d.shipment_track) && d.shipment_track[0]) || {};
  const acts = Array.isArray(d.shipment_track_activities) ? d.shipment_track_activities : [];
  if (!sh.awb_code && !acts.length) return kind === 'awb' ? { found: false, reason: 'unknown_awb' } : { found: true, shipped: false };
  return {
    found: true,
    shipped: true,
    status: String(sh.current_status || '').trim(),
    courier: String(sh.courier_name || '').trim(),
    awb: String(sh.awb_code || '').trim(),
    expected: String(d.etd || sh.edd || '').trim(),
    delivered_on: String(sh.delivered_date || '').trim(),
    track_url: /^https:\/\//.test(String(d.track_url || '')) ? d.track_url : '',
    events: acts.slice(0, 12).map((a) => ({ date: String(a.date || ''), text: String(a.activity || a.status || ''), place: String(a.location || '') }))
  };
}


// City, state and estimated delivery days for a pincode. Never throws for an unknown pincode.
const ORIGIN = '581320';
async function pincode(pin) {
  const s = settings();
  if (!s) return { ok: false };
  const token = await login(s);
  const head = { headers: { Authorization: 'Bearer ' + token } };
  const [a, b] = await Promise.all([
    fetch(BASE + '/open/postcode/details?postcode=' + encodeURIComponent(pin), head).then((r) => r.json()).catch(() => null),
    fetch(BASE + '/courier/serviceability/?pickup_postcode=' + ORIGIN + '&delivery_postcode=' + encodeURIComponent(pin) + '&weight=' + BOX.weight + '&cod=0', head).then((r) => r.json()).catch(() => null)
  ]);
  const pd = (a && a.postcode_details) || {};
  const name = (v) => String(v || '').trim().toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()).slice(0, 60);
  const city = name(pd.city), state = name(pd.state) || STATE_BY_PREFIX[Number(pin.slice(0, 2))] || '';
  let days = 0;
  const data = b && b.data;
  const list = data && Array.isArray(data.available_courier_companies) ? data.available_courier_companies : [];
  if (list.length) {
    const pickId = data.shiprocket_recommended_courier_id || data.recommended_courier_company_id;
    const pick = list.find((c) => c.courier_company_id === pickId) || list[0];
    const n = Math.round(Number(pick.estimated_delivery_days));
    if (n >= 1 && n <= 12) days = n;
  }
  if (!city && !days) return { ok: false };
  return { ok: true, city, state, days };
}

module.exports = { createOrder, settings, track, pincode };
