const sendOrderEmail = require("../utils/sendOrderEmail");
const Order = require("../models/order");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const generateInvoice = require("../utils/generateInvoice"); // 📄 Add this at the top
const path = require("path");
const fs = require("fs");


function generateTrackingNumber() {
  const prefix = "CRAFT";
  const uniquePart = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return `${prefix}-${uniquePart}`;
}

// 📌 Place a new order (Protected route - requires valid JWT)
const placeOrder = async (req, res) => {
  try {
    console.log("🟢 placeOrder endpoint hit");

    // Extract token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id: userId } = decoded;


    const { products, totalAmount, paymentStatus } = req.body;

    // Validate required fields
    if (!products || products.length === 0 || !totalAmount || !paymentStatus) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const trackingNumber = generateTrackingNumber(); // ✅ Add this line!

    const newOrder = new Order({
      userId: userId,
      products,
      totalAmount,
      paymentStatus,
      orderStatus: "Pending",
      trackingNumber, // ✅ required by schema
    });

    await newOrder.save();

    const invoicePath = await generateInvoice({
      orderId: newOrder._id.toString(),
      trackingNumber: newOrder.trackingNumber,
      products: newOrder.products,
      totalAmount: newOrder.totalAmount,
      paymentStatus: newOrder.paymentStatus,
      orderStatus: newOrder.orderStatus,
      shippingInfo: newOrder.shippingInfo,
      placedOn: newOrder.createdAt,
    });
    

    const sendOrderEmail = require("../utils/sendOrderEmail");
const User = require("../models/userModel");
const user = await User.findById(userId);

if (user && user.email) {
  await sendOrderEmail(user.email, {
    trackingNumber: newOrder.trackingNumber,
    totalAmount: newOrder.totalAmount,
    paymentStatus: newOrder.paymentStatus,
    orderStatus: newOrder.orderStatus,
    products: newOrder.products, // this includes name, quantity, price
  });
  
}
    
    res.status(201).json({ 
      success: true, 
      message: "Order placed successfully", 
      order: newOrder 
    });

  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    console.error("🔴 Error placing order:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to place order", 
      error: error.message 
    });
  }
};

// 📌 Get all orders for a logged-in user (Protected route)
const getUserOrders = async (req, res) => {
  try {
    // Extract token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    // Verify token and get userId
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const { id: tokenUserId } = decoded; // Fix key usage

// Compare token userId with requested userId (security check)
const { userId } = req.params;
if (tokenUserId !== userId) {
  return res.status(403).json({ 
    success: false, 
    message: "Unauthorized: You can only view your own orders" 
  });
}


    // const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    const orders = await Order.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });



    res.status(200).json({ 
      success: true, 
      orders: orders.length ? orders : [],
      message: orders.length ? "Orders retrieved" : "No orders found"
    });

  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    console.error("🔴 Error fetching orders:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch orders", 
      error: error.message 
    });
  }
};

// 📌 Update Order Status (Admin/Artisan only - Protected route)
const updateOrderStatus = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin" && decoded.role !== "artisan") {
      return res.status(403).json({ success: false, message: "Unauthorized: Only admins/artisans can update orders" });
    }

    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (!orderId || !orderStatus) {
      return res.status(400).json({ success: false, message: "Order ID and status are required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    ).populate("products.productId"); // optional if you need full product info

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ✅ Send status update email to user
    await sendOrderEmail(updatedOrder.userId.email, {
      trackingNumber: updatedOrder.trackingNumber,
      totalAmount: updatedOrder.totalAmount,
      orderStatus: updatedOrder.orderStatus,
      products: updatedOrder.products,
    });

    res.status(200).json({ 
      success: true, 
      message: "Order status updated and user notified!", 
      order: updatedOrder 
    });

  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    console.error("🔴 Error updating order:", error.message);
    res.status(500).json({ success: false, message: "Failed to update order", error: error.message });
  }
};

// 📌 Get order by tracking number
const getOrderByTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    console.log("Tracking Number Param:", trackingNumber);


    const order = await Order.findOne({ trackingNumber }).populate("products.productId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found with this tracking number",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order tracked successfully",
      order: {
        orderStatus: order.orderStatus,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery || "Not provided",
        placedOn: order.createdAt,
        products: order.products,
      },
    });
  } catch (error) {
    console.error("🔴 Error tracking order:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to track order",
      error: error.message,
    });
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    // Construct file path
    const invoicePath = path.join(__dirname, "../invoices", `${trackingNumber}.pdf`);

    // Check if file exists
    if (!fs.existsSync(invoicePath)) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found for this tracking number",
      });
    }

    // Send the file for download
    res.download(invoicePath, `${trackingNumber}.pdf`);
  } catch (error) {
    console.error("🔴 Error downloading invoice:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to download invoice",
      error: error.message,
    });
  }
};

const updateShippingAddress = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { shippingInfo } = req.body;

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Block changes if order already shipped
    if (["Shipped", "Out for Delivery", "Delivered"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Address cannot be changed at this stage." });
    }

    order.shippingInfo = shippingInfo;
    await order.save();

    res.status(200).json({ message: "Shipping address updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



module.exports = { placeOrder, getUserOrders, updateOrderStatus, getOrderByTrackingNumber, downloadInvoice, updateShippingAddress };