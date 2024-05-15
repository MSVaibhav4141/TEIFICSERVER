const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  forgotPass,
  resetPassord,
  getUserDetail,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUsers,
  updateRole,
  deleteUser,
  getCartItem,
  addToCart,
} = require("../../controllers/userControl");
const isAuth = require("../middlewares/authentication");
const roleAuth = require("../middlewares/roleAuth");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/password/passRecovery").post(forgotPass);
router.route("/password/reset/:tkid").put(resetPassord);
router.route("/logout").post(logout);

router.route("/self").get(isAuth, getUserDetail);
router.route("/self/reset/password").put(isAuth, updatePassword);
router.route("/self/update/profile").put(isAuth, updateProfile);


// Admin Routes
router.route("/admin/users").get(isAuth, roleAuth("admin"), getAllUsers);

router
  .route("/admin/users/:id") 
  .get(isAuth, roleAuth("admin"), getSingleUsers)
  .put(isAuth, roleAuth("admin"), updateRole)
  .delete(isAuth, roleAuth("admin"), deleteUser);

module.exports = router;
