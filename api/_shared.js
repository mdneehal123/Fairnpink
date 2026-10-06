// Prices are fixed here, on the server, so the amount charged cannot be changed from the browser.
const PACKS = { 1: { price: 999, off: 100 }, 2: { price: 1899, off: 150 }, 3: { price: 2699, off: 250 } };

function keys() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  return id && secret ? { id, secret } : null;
}

function clean(value, max) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, max);
}

// Cash on Delivery needs this much paid online in advance. The rest is collected at the door.
const ADVANCE = 99;

// Turns a paid Razorpay order into what the courier system needs. Amounts come from the price table
// above, never from the browser. For an advance order the courier collects the pack price minus the advance.
function shipArgs(o) {
  const n = (o && o.notes) || {};
  const packNumber = Number(String(n.pack || '').replace(/\D/g, ''));
  const pack = PACKS[packNumber];
  if (!pack || !n.name) return null;
  const advance = n.mode === 'advance';
  return {
    id: o.id, packNumber, name: n.name, phone: n.phone, address: n.address, city: n.city, pincode: n.pincode,
    cod: advance,
    itemPrice: advance ? pack.price : Math.round(Number(o.amount) / 100),
    discount: advance ? ADVANCE : 0,
    collect: advance ? pack.price - ADVANCE : 0
  };
}

module.exports = { PACKS, ADVANCE, keys, clean, shipArgs };
