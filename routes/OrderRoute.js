const express = require("express");

const {
    myOrders,
    createOrder,
    getSingleOrder,
    getAllOrders,
    updateOrder,
    deleteOrder,
} = require("../controller/OrderController");

const { isAuthenticatedUser } = require("../middleware/auth");
const { authorizedUser } = require("../controller/UserController");

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, createOrder);

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, myOrders);

router
    .route("/admin/orders")
    .get(isAuthenticatedUser, authorizedUser("admin"), getAllOrders);

router
    .route("/admin/order/:id")
    .put(isAuthenticatedUser, authorizedUser("admin"), updateOrder)
    .delete(isAuthenticatedUser, authorizedUser("admin"), deleteOrder);

module.exports = router;