const { keys } = require('./_shared');

// Tells the store page whether online payment is switched on. Never returns the secret.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ razorpay: !!keys() });
};
