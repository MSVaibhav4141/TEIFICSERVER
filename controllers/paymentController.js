const instance = require('../backend/razorpayIns');
const crypto = require('crypto')
const Product = require("../backend/models/productModel");
const User = require("../backend/models/userModel");
const Order = require("../backend/models/orderModel");
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
    const addressString = req.query.address;
    const address = JSON.parse(addressString);
    const {
      shippingInfo,
      orderItems,
      paymentIn,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentMethod,
    } = address;

    console.log(addressString)
    console.log(address)
    orderItems.forEach(async (item) => {
      const product = await Product.findById(item.product);
      product.userOrderedItem.push({ userDetails: req.user._id });
      await product.save();
    });
    const user = await User.findById(req.user._id);
    user.productsOrdered.push(...orderItems);
    await user.save();
    const paymentInfo = {
      status:'created',
      id:razorpay_payment_id
    }
    await Order.create({
      shippingInfo,
      orderItems,
      paymentIn,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentMethod,
      paymentDate: Date.now(),
      userOrdered: req.user._id,
      paymentIn:paymentInfo
    });

    res.redirect(
      `http://teific.in/payment/success?reference=${razorpay_payment_id}`
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
 
