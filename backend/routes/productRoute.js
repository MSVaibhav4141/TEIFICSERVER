const express = require("express");
const {
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  appendReview,
  deleteReview,
  getProductReview,
  getStartProduct,
  getProductAdmin,
} = require("../../controllers/productControl");


const isAuth = require("../middlewares/authentication");
const roleAuth = require("../middlewares/roleAuth");
const { checkEligibilty } = require("../../controllers/orderController");
const router = express.Router();

router.route("/products").get(getProduct);

router.route("/admin/products/new").post(isAuth,roleAuth("admin"), createProduct);

router.route("/admin/products/getall").get(isAuth,roleAuth("admin"), getProductAdmin);

router.route("/admin/products/:id").put(isAuth,roleAuth("admin"), updateProduct);

router.route("/admin/products/:id").delete(isAuth, roleAuth("admin"), deleteProduct);

router.route("/products/:id").get(getSingleProduct);

// Reviews

router.route("/review/eligible/:id").get(isAuth, checkEligibilty)
router.route("/review").put(isAuth, appendReview);
router.route("/reviews/:id")
.get(getProductReview)
.delete(isAuth,deleteReview);

module.exports = router;


