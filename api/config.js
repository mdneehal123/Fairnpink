const { keys } = require('./_shared');
const shiprocket = require('./_shiprocket');
const { delhiveryOn } = require('./_delhivery');
const { deskOn } = require('./_orderdesk');

// Tells the store page which services are switched on. Never returns any secret.
// razorpay: full online payment; cod: Cash on Delivery booked with Delhivery; orderdesk: orders saved in the Order Desk;
// shiprocket: only tracking of older Shiprocket orders and delivery-days estimates.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ razorpay: !!keys(), cod: delhiveryOn(), orderdesk: deskOn(), shiprocket: !!shiprocket.settings() });
};
