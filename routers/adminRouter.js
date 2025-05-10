const express = require("express");
const router = express.Router();
const { adminDashboard } = require("../controllers/adminController"); // ✅ correct import
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

// Use the actual controller
router.get("/dashboard", authMiddleware, authorizeRoles("admin"), adminDashboard);

module.exports = router;
