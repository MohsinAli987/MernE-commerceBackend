const express = require("express");
const {
    RegisterUser,
    LoginUser,
    logout,
    forgotPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    getAllUsers,
    authorizedUser,
    getSingleUser,
    updateUserRole,
    deleteUser,
} = require("../controller/UserController");
const { isAuthenticatedUser } = require("../middleware/auth");
const { myOrders } = require("../controller/OrderController");

const Router = express.Router();

Router.route("/register").post(RegisterUser);

Router.route("/login").post(LoginUser);

Router.route("/password/forgot").post(forgotPassword);

Router.route("/password/reset/:token").put(resetPassword);

Router.route("/me").get(isAuthenticatedUser, getUserDetails);

Router.route("/me/update").put(isAuthenticatedUser, updateProfile);

Router.route("/logout").get(logout);

Router.route("/password/update").put(isAuthenticatedUser, updatePassword);

Router.route("/admin/users").get(
    isAuthenticatedUser,
    authorizedUser("admin"),
    getAllUsers
);

Router.route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizedUser("admin"), getSingleUser)
    .put(isAuthenticatedUser, authorizedUser("admin"), updateUserRole)
    .delete(isAuthenticatedUser, authorizedUser("admin"), deleteUser);

module.exports = Router;