const express = require("express");
const isAuth = require("../middlewares/authentication");
const roleAuth = require("../middlewares/roleAuth");
const {
  createOrder,
  getOrderDetail,
  getOrderHistory,
  getUsersAllOrder,
  getAllOrder,
  deleteOrder,
  updateOrder,
  getDeliveryDetails,
} = require("../../controllers/orderController");
const router = express.Router();

router.route("/order/new").post(isAuth, createOrder);
router.route("/order/find/:id").get(isAuth, getOrderDetail);
router
  .route("/order/history/:id")
  .get(isAuth, roleAuth("admin"), getOrderHistory);
router.route("/order/self").get(isAuth, getUsersAllOrder);
router.route("/order/sales").get(isAuth, roleAuth("admin"), getAllOrder);
router.route("/order/delivery/:id").get( isAuth ,getDeliveryDetails);
router
  .route("/order/admin/:id")
  .put(isAuth, roleAuth("admin"), updateOrder)
  .delete(isAuth, roleAuth("admin"), deleteOrder);
module.exports = router;
