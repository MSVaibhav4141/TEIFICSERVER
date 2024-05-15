const mongoose = require("mongoose");
const validate = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [50, "Can't exceed 50 characters"],
    minLength: [3, "Name Must have 3 Characters"],
  },

  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validate.isEmail, "Please Enter valid email"],
  },

  mobileNumber: {
    type: String,
    required: [true, "Please Enter your Mobile Number"],
    minLength: [5, "Mob no. incorrect"],
    maxLength: [10, "Mob no. incorrect"],
  },
  productsOrdered: {
    type: Array,
    default: [],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your password"],
    minLength: [8, "Password must be of atleast 8 characters"],
    select: false,
  },

  avatar: {
    public_ID: {
      type: String,
      required: [true, "Specify Public Id Of image"],
    },
    public_URI: {
      type: String,
      required: [true, "Specify Public URI Of image"],
    },
  },

  cart:{
    type:Array,
    default:[]
  },

  role: {
    type: String,
    default: "user",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive:{
    type:Boolean,
    default:true
  },
  idDeletedDate:{
    type:Date,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcryptjs.hash(this.password, 11);
});

// Generating JWT
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SEC, {
    expiresIn: process.env.JWT_EXP,
  });
};

// Verifying Password
userSchema.methods.verifyPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Reseting Password
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing token
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .toString("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
module.exports = mongoose.model("User", userSchema);

// Teific@ValidateOtP^%1221
