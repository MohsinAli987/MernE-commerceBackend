const catchAsyncFunc = require("./catchAsyncFunc");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");

exports.isAuthenticatedUser = catchAsyncFunc(async(req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodeData.id);

    next();
});