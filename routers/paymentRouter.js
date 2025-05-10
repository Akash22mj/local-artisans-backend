// original one
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/order");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const sendOrderEmail = require("../utils/sendOrderEmail");

// ✅ Tracking Number Generator
function generateTrackingNumber() {
  const prefix = "CRAFT";
  const uniquePart = Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
  return `${prefix}-${uniquePart}`;
}

// ✅ Route 1: Create Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { cartItems, userId, userDetails } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const transformedCart = cartItems.map((item) => ({
      productId: item._id?.toString() || item.productId?.toString(),
      title: item.title || "Unnamed Product",
      quantity: item.quantity,
      price: item.price,
      discountedPrice: item.discountedPrice, // ✅ add this line
      image: item.image,
    }));

    console.log("🛒 Sending cart to Stripe:", transformedCart);

    const line_items = transformedCart.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
        },
        // unit_amount: Math.round(item.price * 100),
        unit_amount: Math.round((item.discountedPrice || item.price) * 100), // ✅ corrected
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      metadata: {
        userId: userId?.toString() || "",
        cart: JSON.stringify(transformedCart),
        userDetails: userDetails ? JSON.stringify(userDetails) : "null",
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("❌ Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Route 2: Stripe Webhook
router.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("✅ Webhook received:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const userId = metadata.userId || "";

    let cart = [];
    let userDetails = null;

    try {
      if (typeof metadata.cart === "string") {
        cart = JSON.parse(metadata.cart);
        console.log("🛍 Parsed cart from metadata:", cart);
      }
    } catch (err) {
      console.error("❌ Failed to parse cart metadata:", err.message);
    }

    try {
      if (
        typeof metadata.userDetails === "string" &&
        metadata.userDetails !== "undefined" &&
        metadata.userDetails !== "null"
      ) {
        userDetails = JSON.parse(metadata.userDetails);
      }
    } catch (err) {
      console.error("❌ Failed to parse userDetails metadata:", err.message);
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("❌ Invalid userId received in webhook:", userId);
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const transformedProducts = [];

    for (const item of cart) {
      if (mongoose.Types.ObjectId.isValid(item.productId)) {
        transformedProducts.push({
          productId: item.productId,
          name: item.title || "Unnamed Product",
          quantity: item.quantity,
          //price: item.price,
          price: item.discountedPrice || item.price, // 💥 apply discount if present
        });
      } else {
        console.warn("⚠️ Invalid productId in cart:", item.productId, item.title);
      }
    }

    if (transformedProducts.length === 0) {
      console.error("❌ No valid products found in cart.");
      return res.status(400).json({ error: "No valid products to save" });
    }

    // ✅ Generate tracking number
    const trackingNumber = generateTrackingNumber();

    try {
      const newOrder = new Order({
        userId,
        products: transformedProducts,
        totalAmount: session.amount_total / 100,
        paymentStatus: session.payment_status === "paid" ? "Paid" : "Unpaid",
        orderStatus: "Pending",
        stripeSessionId: session.id,
        shippingInfo: userDetails,
        trackingNumber, // ✅ Added this line
      });

      await newOrder.save();
      console.log("✅ Order saved successfully for user:", userId);


      try {
        if (userDetails?.email) {
          await sendOrderEmail(userDetails.email, {
            trackingNumber,
            totalAmount: session.amount_total / 100,
            orderStatus: "Pending",
            products: transformedProducts, // ✅ Pass product details to the email
          });
          console.log("📨 Order confirmation email sent to:", userDetails.email);
        } else {
          console.warn("⚠️ No user email found. Email not sent.");
        }
      } catch (err) {
        console.error("❌ Failed to send order email:", err.message);
      }
      
    } catch (err) {
      console.error("❌ Failed to save order:", err.message);
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;
