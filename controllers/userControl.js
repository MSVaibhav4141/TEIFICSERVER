const ErrorHandler = require("../backend/errorHandler/errorHandler");
const asyncErrorCatcher = require("../backend/utils/asyncErrorHandler");
const User = require("../backend/models/userModel");
const Product = require("../backend/models/productModel");
const jwtMssg = require("../backend/utils/jwtMssg");
const sendEmail = require("../backend/utils/sendEmail");
const { resetPasswordMessage } = require("../backend/utils/mailFormat");
const crypto = require("crypto");
const activityMail = require("../backend/utils/acticityMailer");
const cloudinary = require("cloudinary");
const { passwordChange } = require("../backend/utils/passwordChange");
//Registering a USER

exports.registerUser = asyncErrorCatcher(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });
  const { name, email, password, mobileNumber } = req.body;
  const user = await User.create({ 
    name,
    email,
    password,
    mobileNumber,
    avatar: {
      public_ID: myCloud.public_id,
      public_URI: myCloud.secure_url,
    },
  });
  jwtMssg(user, 201, res); 
});

// USER Login

exports.loginUser = asyncErrorCatcher(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid username or password", 401));
  }
  if(!user.isActive){
    return next(new ErrorHandler("Invalid username or password", 401));
  }
  const isPassword = await user.verifyPassword(password);

  if (!isPassword) {
    return next(new ErrorHandler("Invalid username or password", 401));
  }

  jwtMssg(user, 200, res);
});

// Logout user

exports.logout = asyncErrorCatcher(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});

// Forgot Password

exports.forgotPass = asyncErrorCatcher(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if ( !user || !user.isActive ) {
    return next(new ErrorHandler("User not found", 404));
  }

  const resetToken = user.generateResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordURI = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = resetPasswordMessage(user, resetPasswordURI);

  try {
    await sendEmail({
      email: user.email,
      subject: "Teific Password recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully`,
    });
  } catch (e) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(e.message, 500));
  }
});

//Reset Password

exports.resetPassord = asyncErrorCatcher(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.tkid)
    .toString("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler("Invalid or Expired Token", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Both the password must match", 400));
  }

  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  const message = passwordChange(user);

  try {
    await sendEmail({
      email: user.email,
      subject: "Teific Password Change Alert",
      message,
    });

    jwtMssg(user, 200, res);
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
});

// Get User Detail

exports.getUserDetail = asyncErrorCatcher(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if(!user.isActive){
    return next(new ErrorHandler("No SUch Account Exists", 404));
  }
  res.status(200).json({
    message: true,
    user,
  });
});

// Update User password

exports.updatePassword = asyncErrorCatcher(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!req.body.oldPassword) {
    return next(new ErrorHandler("Please enter your old Password", 400));
  }

  if (!req.body.newPassword || !req.body.confirmPassword) {
    return next(
      new ErrorHandler("Please your new password in both feilds", 400)
    );
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Both password must match", 400));
  }

  const isPassword = await user.verifyPassword(req.body.oldPassword);

  if (!isPassword) {
    return next(new ErrorHandler("Old Password is incorrect ! Try again", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  jwtMssg(user, 200, res);
});

//  update User Profile

exports.updateProfile = asyncErrorCatcher(async (req, res, next) => {
  const newUserData = {
    email: req.body.email,
    name: req.body.name,
    mobileNumber: req.body.number,
  };
  if (req.body.avatar && req.body.avatar !== " ") {
    const data = await User.findById(req.user.id);
    const { avatar } = data;
    await cloudinary.v2.uploader.destroy(avatar.public_ID);
    try {
      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 400,
        crop: "scale",
      });

      newUserData.avatar = {
        public_ID: myCloud.public_id,
        public_URI: myCloud.secure_url,
      };
    } catch (e) {
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//  Get all Users (ADMIN)

exports.getAllUsers = asyncErrorCatcher(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    users,
    userSigned:req.user._id
  });
});

// Get a single user (ADMIN)
exports.getSingleUsers = asyncErrorCatcher(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exsits with ID of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,

  });
});

// update User role  (ADMIN)

exports.updateRole = asyncErrorCatcher(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`User does not exsits with ID of ${req.params.id}`, 404)
    );
  }
  if (req.user._id.toString() === req.params.id) {
    return next(new ErrorHandler("You can't change your own role", 400));
  }

  if (user.email === process.env.PRCTRMAIL) {
    const message = `A suspicious activity of changing your role has been done by user ${req.user.name} having ${req.user.email} and ${req.user.id} as email and ID respectivly`;
    try {
      await activityMail({
        message,
      });

     return next(new ErrorHandler("Super Prevliged Admin can't be updated", 403));
    } catch (e) {
      return next(new ErrorHandler(e.message, 500));
    }
  }
  if (user.role === "admin") {
    if (req.user.email !== process.env.PRCTRMAIL)
      return next(new ErrorHandler("You can't change an admin role", 400));
  }

  user.role = req.body.role;

  await user.save();

  res.status(200).json({
    success: true,
    message: `${user.name}'s Role has been changed to ${req.body.role}`,
  });
});

// Deleting a user (ADMIN)

exports.deleteUser = asyncErrorCatcher(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const userName = user.name;

  if (!user) {
    return next(
      new ErrorHandler(`User does not exsits with ID of ${req.params.id}`, 404)
    );
  }

  if ((user._id).toString() === (req.user._id).toString()) {
    return next(
      new ErrorHandler(`You cant delete yourself`, 400)
    );
  }

  if (user.email === process.env.PRCTRMAIL) {
    const message = `A suspicious activity of deleting your account has been done by user ${req.user.name} having ${req.user.email} and ${req.user.id} as email and ID respectivly`;
    try {
      await activityMail({
        message,
      });

      return next(new ErrorHandler("Super Prevliged Admin can't be deleted", 403));
    } catch (e) {
      return next(new ErrorHandler(e.message, 500));
    }
  }
  const imageId = user.avatar.public_ID;
  await cloudinary.v2.uploader.destroy(imageId);
  user.isActive = false;
  user.idDeletedDate = new Date();
  await user.save();

  res.status(200).json({
    sucess: true,
    message: `${userName} removed successfully`,
  });
});
