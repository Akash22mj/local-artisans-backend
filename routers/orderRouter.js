const express = require("express");
const router = express.Router();
const { placeOrder, getUserOrders, updateOrderStatus, getOrderByTrackingNumber, downloadInvoice, updateShippingAddress } = require("../controllers/orderController");

const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

// 📌 Place an order (User)
router.post("/place", authMiddleware, placeOrder);

// 📌 Get all orders for a user
router.get("/user/:userId", authMiddleware, getUserOrders);

// 📌 Update order status (Admin or Artisan only)
router.put("/update/:orderId", authMiddleware, authorizeRoles, updateOrderStatus);

// 📌 Track order by tracking number (Public)
//router.get("/track/:trackingNumber", getOrderByTrackingNumber);

router.get("/track/:trackingNumber", getOrderByTrackingNumber);

router.get("/invoice/:trackingNumber", downloadInvoice);

router.put('/update-address/:orderId', authMiddleware, updateShippingAddress);


module.exports = router;
