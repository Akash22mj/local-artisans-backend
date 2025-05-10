const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  discountType: {
    type: String,
    enum: ["flat", "percentage"],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  }
});

module.exports = mongoose.model("Coupon", couponSchema);
