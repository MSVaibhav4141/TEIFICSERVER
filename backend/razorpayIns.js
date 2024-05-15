const Razorpay = require('razorpay');
const dotenv = require("dotenv");

dotenv.config({ path: "backend/config/config.env" });

module.exports = new Razorpay({
    key_id: process.env.RAZORPAYID,
    key_secret:  process.env.RAZORPAYKEY,
});