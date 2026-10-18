// Prices are fixed here, on the server, so the amount charged cannot be changed from the browser.
// price = pack price (also what Cash on Delivery collects at the door); off = saving when paid in full online.
const PACKS = { 1: { price: 999, off: 100 }, 2: { price: 1899, off: 150 }, 3: { price: 2699, off: 250 } };

const PRODUCT = 'Fair N Pink Advance Radiance Cream';
// Order Desk (brand "fn"). One jar is exactly the Order Desk product fn2 (Fair N Pink Advanced Cream 10g, Rs 999).
// Packs of 2 and 3 are sold at their own price, so they go in without a product id and keep the name and price as sold.
const DESK_ID = { 1: 'fn2', 2: '', 3: '' };
const itemName = (packNumber) => PRODUCT + ' 10g – Pack of ' + packNumber;

// Parcel for every pack: 100 g in a 10 x 10 x 8 cm box, as confirmed by the owner.
const BOX = { grams: 100, length: 10, breadth: 10, height: 8 };

// State from the first two digits of the pincode, used when no courier lookup is available.
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
const stateFor = (pin) => STATE_BY_PREFIX[Number(String(pin).slice(0, 2))] || '';

function keys() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  return id && secret ? { id, secret } : null;
}

function clean(value, max) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function body(req) {
  const b = req.body;
  if (typeof b === 'string') { try { return JSON.parse(b); } catch (e) { return {}; } }
  return b && typeof b === 'object' ? b : {};
}

// Delivery details from the order form, checked the same way on every endpoint. Returns null when something is missing.
function customer(b) {
  const c = {
    name: clean(b.name, 80), phone: String(b.phone || '').replace(/\D/g, '').slice(-10), address: clean(b.address, 250),
    city: clean(b.city, 60), pincode: clean(b.pincode, 6)
  };
  if (c.name.length < 2 || !/^[6-9]\d{9}$/.test(c.phone) || c.address.length < 8 || c.city.length < 2 || !/^[1-9]\d{5}$/.test(c.pincode)) return null;
  c.state = stateFor(c.pincode);
  return c;
}

// A site order number with the Fair N Pink prefix, e.g. FPMB3K9Q2X. Also the Order Desk reference, so a retry never duplicates.
function newRef() {
  return 'FP' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, '0');
}
const cleanRef = (v) => String(v || '').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 20);

// Pack details worked out on the server. online = paid in full through Razorpay; otherwise Cash on Delivery at the pack price.
function quote(packNumber, online) {
  const pack = PACKS[Number(packNumber)];
  if (!pack) return null;
  const n = Number(packNumber);
  return { packNumber: n, name: itemName(n), deskId: DESK_ID[n], sub: pack.price, disc: online ? pack.off : 0, total: online ? pack.price - pack.off : pack.price };
}

module.exports = { PACKS, PRODUCT, BOX, keys, clean, body, customer, newRef, cleanRef, quote, stateFor };
