// Shiprocket is no longer used for new orders (paid orders go to the Order Desk, Cash on Delivery to Delhivery).
// What is left here only tracks orders that were shipped through Shiprocket before the switch, and gives the
// delivery-days estimate for a pincode. Both stay off unless SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD are set.
const BASE = 'https://apiv2.shiprocket.in/v1/external';

// Pickup address nickname in Shiprocket (Azad Nagar 4th Cross, Bhatkal 581320). Not a secret.
const PICKUP = 'Primary';

// Parcel weight used for the delivery-days estimate.
const BOX = { weight: 0.1 };
const { stateFor } = require('./_shared');

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
  const city = name(pd.city), state = name(pd.state) || stateFor(pin);
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

module.exports = { settings, track, pincode };
