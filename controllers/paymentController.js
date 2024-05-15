const instance = require('../backend/razorpayIns');
const crypto = require('crypto')

const asyncErrorHandler = require("../backend/utils/asyncErrorHandler");

exports.checkout = asyncErrorHandler(async (req, res, next) => {
  const amount = req.body.amount * 100
  const options = {
    amount , 
    currency: "INR",
  };
  const order = await instance.orders.create(options)
  res.status(200).json({
    success:true,
    order
  }) 
});
 
exports.paymentVerification = asyncErrorHandler(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAYKEY)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Database comes here

    // await Payment.create({
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

    res.redirect(
      `http://localhost:3000/payment/success?reference=${razorpay_payment_id}`
    );
  } else {
    res.status(400).json({
      success: false,
    });
  }
});
 
exports.getKey = asyncErrorHandler(async (req, res, next) => {
  res.status(200).json({
    key:process.env.RAZORPAYID
  })
});
 
