const ErrorHandler = require("../errorHandler/errorHandler");
const asyncErrorCatcher = require("../utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const isAuth = asyncErrorCatcher(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  const data = jwt.verify(token, process.env.JWT_SEC);

  req.user = await User.findById(data.id);
  next();
});

module.exports = isAuth;
