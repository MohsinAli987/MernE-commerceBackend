const catchAsyncFunc = require("../middleware/catchAsyncFunc");
const User = require("../models/UserModel");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");

const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

// Register a user
exports.RegisterUser = catchAsyncFunc(async (req, res, next) => {
  // Upload the file to Cloudinary
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });

  // we can get the data directly into the variables
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  // validate user with JWT token
  sendToken(user, 201, res);
});

// Login user controller
exports.LoginUser = catchAsyncFunc(async (req, res, next) => {
  const { email, password } = req.body;

  // check if the user enter the email and password
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Username & Password", 400));
  }

  // find a user and match a password by the select because we add select to the user schema
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Username & Password", 401));
  }

  // compare the password with the user password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Username & Password", 401));
  }

  // validate user with JWT token
  sendToken(user, 200, res);
});

exports.logout = catchAsyncFunc(async (req, res, next) => {
  // get token from the cookies and set it to null
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

exports.authorizedUser = (...roles) => {
  return (req, res, next) => {
    // if role is not admin
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }

    // if role is admin return back a request
    next();
  };
};

// forget user password

exports.forgotPassword = catchAsyncFunc(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // get user reset password token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordURL = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  const message = `Your password reset token is: \n\n ${resetPasswordURL} \n\n IF you have not requested this email then, ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `E-commerce password recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // after set values to database save the user to data
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// reset user password

exports.resetPassword = catchAsyncFunc(async (req, res, next) => {
  // hashing and adding resetpassword token to user schema
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password token is invalid or has been expire",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not matched", 400));
  }

  // change the user password if the password is matched
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// get login user details
exports.getUserDetails = catchAsyncFunc(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update user password
exports.updatePassword = catchAsyncFunc(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Username & Password", 401));
  }

  // compare the password with the user password
  const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid old Password", 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not matched", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

// update user profile
exports.updateProfile = catchAsyncFunc(async (req, res, next) => {
  // create an objet of user
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const imageID = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageID);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  // find and update user now
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// get all user for admin
exports.getAllUsers = catchAsyncFunc(async (req, res, next) => {
  // get all user
  const user = await User.find();

  res.status(200).json({
    success: true,
    user,
  });
});

// get single user -- Admin
exports.getSingleUser = catchAsyncFunc(async (req, res, next) => {
  // find user
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update user role
exports.updateUserRole = catchAsyncFunc(async (req, res, next) => {
  const userUpdateData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  // find user
  const user = await User.findByIdAndUpdate(req.params.id, userUpdateData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(new ErrorHandler("user not found", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// delete user -- Admin
exports.deleteUser = catchAsyncFunc(async (req, res, next) => {
  // find user
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User Not Found with Id:${req.params.id}`, 400)
    );
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
