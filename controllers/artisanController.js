const Product = require("../models/productModel");
const Order = require("../models/order");
const User = require("../models/userModel");

// 🧠 Artisan Dashboard Controller
const getArtisanDashboard = async (req, res) => {
  try {
    const artisanId = req.user._id;

    // 1. Get all products uploaded by this artisan
    const products = await Product.find({ artisanId: artisanId }); // 👈 You’ll add this field in Product model (explained below)

    // 2. Get all orders where any product belongs to this artisan
    const allOrders = await Order.find({ "products.productId": { $exists: true } });

    let totalSold = 0;
    let totalRevenue = 0;

    // Loop through each order to filter artisan's products
    allOrders.forEach((order) => {
      order.products.forEach((item) => {
        const artisanProduct = products.find((p) => p._id.toString() === item.productId.toString());

        if (artisanProduct) {
          totalSold += item.quantity;
          totalRevenue += item.quantity * item.price;
        }
      });
    });

    // Calculate total stock (you need to add `stock` field in product model)
    const totalStock = products.reduce((acc, product) => acc + (product.stock || 0), 0);

    res.status(200).json({
      message: "Artisan dashboard data fetched successfully",
      data: {
        totalProducts: products.length,
        totalStock,
        totalSold,
        totalRevenue,
        products,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { getArtisanDashboard };
