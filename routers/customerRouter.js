const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

// Dummy controller
const myOrders = (req, res) => {
  res.json({ message: "Here are your orders" });
};

router.get("/my-orders", authMiddleware, authorizeRoles("customer"), myOrders);

module.exports = router;
