const Order = require("../models/orderModel");
const Product = require("../models/ProductModels");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncFunc = require("../middleware/catchAsyncFunc");

// create new order
exports.createOrder = catchAsyncFunc(async(req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user.id,
    });

    res.status(200).json({
        success: true,
        order,
    });
});

// get single order
exports.getSingleOrder = catchAsyncFunc(async(req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );
    if (!order) {
        return next(new ErrorHandler("Order Not Found with this ID", 404));
    }
    res.status(200).json({
        success: true,
        order,
    });
});

// get logged in user  Orders
exports.myOrders = catchAsyncFunc(async(req, res, next) => {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        orders,
    });
});

// get all order
exports.getAllOrders = catchAsyncFunc(async(req, res, next) => {
    // const find orders
    const orders = await Order.find();

    // calculate the total amount
    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        orders,
        totalAmount,
    });
});

// update order status -- Admin
exports.updateOrder = catchAsyncFunc(async(req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found with this ID", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("You have already delivered this order", 400));
    }

    // update the stock
    order.orderItems.forEach(async(items) => {
        await updateStock(items.product, items.quantity);
    });

    order.orderStatus = req.body.status;

    if (order.orderStatus === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        order,
    });

    async function updateStock(id, quantity) {
        const product = await Product.findById(id);

        product.Stock -= quantity;

        await product.save({ validateBeforeSave: false });
    }
});

// delete order by --admin
exports.deleteOrder = catchAsyncFunc(async(req, res, next) => {
    const order = Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found with this ID", 404));
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
    });
});