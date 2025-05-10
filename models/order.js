// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     products: [
//       {
//         productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
//         name: String,
//         quantity: Number,
//         price: Number,
//       },
//     ],
//     totalAmount: {
//       type: Number,
//       required: true,
//     },
//     paymentStatus: {
//       type: String,
//       enum: ["Pending", "Completed", "Failed"],
//       default: "Pending",
//     },
//     orderStatus: {
//       type: String,
//       enum: ["Pending", "Processing", "Shipped", "Delivered", "Canceled"],
//       default: "Pending",
//     },
//   },
//   { timestamps: true }
// );

// const Order = mongoose.model("Order", orderSchema);
// module.exports = Order;


const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingInfo: {
      name: String,
      email: String,
      phone: String,
      altPhone: String,
      address: String,
      landmark: String,
      city: String,
      state: String,
      zip: String,
      shippingMethod: String,
      deliveryInstructions: String,
      deliveryTime: String,
      giftWrap: Boolean,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid"],
      required: true
    },
    
    orderStatus: {
      type: String,
      enum: ["Pending", "Processed", "Shipped", "Out for Delivery", "Delivered"],
      default: "Pending"
    },
    estimatedDelivery: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 5);
        return date;
      }
    },
    
    
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
