const express = require("express");

const app = express();

const MiddlewareAuthError = require("./middleware/error");
const bodyParse = require("body-parser");
const fileUpload = require("express-fileupload");
app.use(express.json());

// include routes
const products = require("./routes/ProductRoute");
const user = require("./routes/UserRoute");
const order = require("./routes/OrderRoute");

const cookieParser = require("cookie-parser");

app.use(cookieParser());

// use the file upload
app.use(bodyParse.urlencoded({ extended: true }));
app.use(fileUpload());

// import the product routes
app.use("/api/v1", products);
// import the user routes
app.use("/api/v1", user);
// import order routes
app.use("/api/v1", order);
// Middleware for error
app.use(MiddlewareAuthError);

module.exports = app;