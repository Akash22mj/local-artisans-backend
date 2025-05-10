const express = require("express");
const router = express.Router();
const Coupon = require("../models/coupon");

router.post("/apply", async (req, res) => {
  const { code } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ success: false, message: "Coupon expired" });
    }

    res.json({
      success: true,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
