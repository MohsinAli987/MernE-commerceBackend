const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // mongoDB errors
  if (err.name === "CastError") {
    const message = `resource not found. Invlaid: ${err.path}`;
    err = new ErrorHandler(message, 404);
  }

  // error handler for duplicate
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 404);
  }

  // Wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const message = "Json Web Token is Invalid, Try agin";
    err = new ErrorHandler(message, 404);
  }

  // jwt EXPIRE error
  if (err.name === "TokenExpiredError") {
    const message = "Json Web Token is Expired, Try agin";
    err = new ErrorHandler(message, 404);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
