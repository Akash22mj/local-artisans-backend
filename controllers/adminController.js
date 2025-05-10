const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/order");

const adminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // 🔵 Fetch only paid orders
    const paidOrders = await Order.find({ paymentStatus: "Paid" });

    // 💰 Calculate total revenue
    const totalRevenue = paidOrders.reduce((acc, order) => {
      const orderTotal = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      return acc + orderTotal;
    }, 0);

    const totalArtisans = await User.countDocuments({ role: 'artisan' });
    
    // 🧶 Count products awaiting approval
    const productsAwaitingApproval = await Product.countDocuments({ isApproved: false });

    // 📊 Calculate average order value (rounded)
    const averageOrderValue = paidOrders.length > 0 
      ? Math.round(totalRevenue / paidOrders.length) 
      : 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Math.round(totalRevenue),
      productsAwaitingApproval,
      averageOrderValue,
      totalArtisans, // 👈 Add this
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { adminDashboard };
