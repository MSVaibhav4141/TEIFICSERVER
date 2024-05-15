const Product = require("../backend/models/productModel");
const asyncErrorCatcher = require("../backend/utils/asyncErrorHandler");
const ApiFeature = require("../backend/utils/apiFeatures");
const ErrorHandler = require("../backend/errorHandler/errorHandler");
const User = require("../backend/models/userModel");
const axios = require("axios")
const Order = require("../backend/models/orderModel");
// New order
exports.createOrder = asyncErrorCatcher(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentIn,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
  } = req.body;
  orderItems.forEach(async (item) => {
    const product = await Product.findById(item.product);
    product.userOrderedItem.push({ userDetails: req.user._id });
    await product.save();
  });
  const user = await User.findById(req.user._id);
  user.productsOrdered.push(...orderItems);
  await user.save();
  const order = await Order.create({
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
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// Get order details

exports.getOrderDetail = asyncErrorCatcher(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "userOrdered",
    "name email"
  );
  
  if (!order) {
    return next(new ErrorHandler("Order not found:(", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// get user order history

exports.getOrderHistory = asyncErrorCatcher(async (req, res, next) => {
  const order = await Order.find({ userOrdered: req.params.id });

  if (!order) {
    return next(new ErrorHandler("Order not found:(", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});
// get order history

exports.getUsersAllOrder = asyncErrorCatcher(async (req, res, next) => {
  const order = await Order.find({ userOrdered: req.user._id });

  res.status(200).json({
    success: true,
    order,
  });
});
exports.checkEligibilty = asyncErrorCatcher(async (req, res, next) => {
  const order = await Order.find({ userOrdered: req.user._id });
  let isEligible = false;
  order.some((item) => {
    item.orderItems.some((i) => {
      if (
        i.product.toString() === req.params.id &&
        item.orderStatus === "Delivered"
      ) {
        isEligible = true;
        return true;
      }
    });
  });
  res.status(200).json({
    success: true,
    isEligible,
    userSigned: req.user._id.toString(),
  });
});

// get all orders (ADMIN)

exports.getAllOrder = asyncErrorCatcher(async (req, res, next) => {
  const order = await Order.find().populate(
    "userOrdered",
    "name email mobileNumber"
  );
  let totalSale = 0;
  order.forEach((order) => {
    totalSale += order.totalPrice;
  });

  res.status(200).json({
    totalSale,
    order,
  });
});

exports.updateOrder = asyncErrorCatcher(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  if (req.body.orderStatus === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quant);
    });
  }
  order.orderStatus = req.body.orderStatus;

  if (req.body.orderStatus === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// delete Order -- Admin
exports.deleteOrder = asyncErrorCatcher(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  await order.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
  });
});

// Get delivery details
exports.getDeliveryDetails = asyncErrorCatcher(async (req, res, next) => {
  const detail = axios.get(`https://api.postalpincode.in/pincode/${req.params.id}`)
  const deliveryDetail = await detail;
  res.status(200).json({
    detail:deliveryDetail.data[0].PostOffice[0],
    success : deliveryDetail.data[0].Status
  })
});