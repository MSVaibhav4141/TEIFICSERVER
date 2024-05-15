const express = require("express");
const isAuth = require("../middlewares/authentication");
const {checkout, paymentVerification, getKey} = require('../../controllers/paymentController')
const router = express.Router();

router.route("/checkout").post(isAuth , checkout)
router.route("/get/key").get(isAuth , getKey)
router.route("/paymentVerification").post(isAuth , paymentVerification)
module.exports = router;