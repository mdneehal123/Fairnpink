// Sends a paid order to Shiprocket so it appears under New Orders, ready to ship.
// Switched on by three environment variables: SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD (an API user,
// not the main login) and SHIPROCKET_PICKUP (the pickup location nickname).
const BASE = 'https://apiv2.shiprocket.in/v1/external';

// Parcel sizes per pack. Weight in kg, sizes in cm. Change these to the real packed values.
const PARCEL = {
  1: { weight: 0.1, length: 10, breadth: 10, height: 8 },
  2: { weight: 0.2, length: 14, breadth: 10, height: 8 },
  3: { weight: 0.3, length: 18, breadth: 10, height: 8 }
};

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
  const pickup = process.env.SHIPROCKET_PICKUP;
  return email && password && pickup ? { email, password, pickup } : null;
}

let cached = { token: '', until: 0 };

async function login(s) {
  if (cached.token && Date.now() < cached.until) return cached.token;
  const r = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: s.email, password: s.password })
  });
  const d = await r.json();
  if (!r.ok || !d.token) throw new Error('shiprocket_login_failed');
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

// order: { id, packNumber, amountRupees, name, phone, address, city, pincode }
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
        selling_price: order.amountRupees
      }],
      payment_method: 'Prepaid',
      sub_total: order.amountRupees,
      length: parcel.length,
      breadth: parcel.breadth,
      height: parcel.height,
      weight: parcel.weight
    })
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !(d.order_id || d.shipment_id)) return { status: 'failed', reason: 'shiprocket_rejected' };
  return { status: 'created', shiprocket_order_id: d.order_id || null };
}

module.exports = { createOrder, settings };
