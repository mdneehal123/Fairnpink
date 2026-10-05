const { keys } = require('./_shared');
const shiprocket = require('./_shiprocket');

// Tells the store page which services are switched on. Never returns any secret.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ razorpay: !!keys(), shiprocket: !!shiprocket.settings() });
};
