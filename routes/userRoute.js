const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  getUser,
  updateUser,
  handleRefreshToken,
  handleLogout,
  forgotPassword,
  resetPassword,
  cartFill,
  cartUser,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrder,
  updateOrderStatus
} = require("../controller/userController");
const userMiddleware = require("../middlewares/userMiddleware");
const checkRole = require("../middlewares/rolMiddleware");

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/my-user:id", userMiddleware, getUser);
router.put("/update-user:id", updateUser);
router.post("/refresh-token", handleRefreshToken);
router.post("/logout", handleLogout);

router.post("/cart-fill", userMiddleware, cartFill);
router.get("/user-cart", userMiddleware, cartUser);
router.delete("/empty-cart", userMiddleware, emptyCart);
router.post("/apply-coupon", userMiddleware, applyCoupon);
router.post("/create-order", userMiddleware, createOrder); 
router.get("/get-order", userMiddleware, getOrder); 
router.put("/update-order-status", userMiddleware, updateOrderStatus);

module.exports = router;
