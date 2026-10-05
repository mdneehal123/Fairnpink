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

module.exports = { PACKS, keys, clean };
