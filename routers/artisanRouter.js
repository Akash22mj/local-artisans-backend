const express = require("express");
const router = express.Router();
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");
const { getArtisanDashboard } = require("../controllers/artisanController");

// Dummy controller
const addProduct = (req, res) => {
  res.json({ message: "Product added by artisan" });
};

router.post("/add-product", authMiddleware, authorizeRoles("artisan"), addProduct);

router.get("/dashboard", authMiddleware, authorizeRoles("artisan"), getArtisanDashboard);

module.exports = router;
