const express = require("express");

const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getSingleProduct,
    createProductReview,
    getProductReviews,
    deleteProductReview,
} = require("../controller/ProductController");

const { isAuthenticatedUser } = require("../middleware/auth");
const { authorizedUser } = require("../controller/UserController");
const { myOrders } = require("../controller/OrderController");

const router = express.Router();

router.route("/products").get(getAllProducts);

router
    .route("/products/new")
    .post(isAuthenticatedUser, authorizedUser("admin"), createProduct);

router
    .route("/products/:id")
    .put(isAuthenticatedUser, authorizedUser("admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizedUser("admin"), deleteProduct);

router.route("/product/:id").get(getSingleProduct);

router.route("/review").put(isAuthenticatedUser, createProductReview);

router
    .route("/reviews")
    .get(getProductReviews)
    .delete(isAuthenticatedUser, deleteProductReview);

module.exports = router;