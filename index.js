//This code is working perfectly
require("dotenv").config({ path: './.env' });
const express = require('express');
const cors = require('cors');
//const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const http = require("http"); // 🆕 Required for Socket.IO
const { Server } = require("socket.io");

console.log("✅ STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Loaded" : "Not Found");
console.log("✅ JWT_SECRET:", process.env.JWT_SECRET ? "Loaded" : "Not Found");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize Express app
const app = express();
const server = http.createServer(app); // 🆕 wrap express app
const port = process.env.PORT || 5000;

// Import routers
const UserRouter = require('./routers/userRouter');
const ProductRouter = require('./routers/productRouter');
const ContactRouter = require('./routers/contactRouter');
const UtilRouter = require('./routers/util');
const orderRouter = require("./routers/orderRouter");
const authRoutes = require("./routers/authRoutes");
const paymentRouter = require("./routers/paymentRouter");
const adminRouter = require("./routers/adminRouter");
const artisanRouter = require("./routers/artisanRouter");
const customerRouter = require("./routers/customerRouter");
const couponRoutes = require("./routers/couponRouter");


// 🆕 Setup Socket.IO
const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // your React frontend
      methods: ["GET", "POST"]
    }
  });
  
  // 🧠 In-memory map of connected users: { userId: socket.id }
  const users = {};
  
  // 🧩 Socket.IO Events
  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);
  
    // Save userId when user joins
    socket.on("registerUser", (userId) => {
      users[userId] = socket.id;
      console.log(`🧍 User ${userId} registered with socket ${socket.id}`);
    });
  
   // Join a room
 // Join specific room
 socket.on("joinRoom", (roomId) => {
    if (roomId) {
      socket.join(roomId);
      console.log(`🟢 Socket ${socket.id} joined room ${roomId}`);
    } else {
      console.warn("❗ Attempt to join undefined room");
    }
  });
  
  // Send a message to a room
  socket.on("sendMessage", ({ roomId, senderId, message }) => {
    if (roomId && senderId && message) {
      const payload = { senderId, message };
      io.to(roomId).emit("receiveMessage", payload);
      console.log(`📩 Message in ${roomId} from ${senderId}: ${message}`);
    } else {
      console.warn("❗ Incomplete message payload:", { roomId, senderId, message });
    }
  });
  
  
  socket.on("disconnect", () => {
    const disconnectedUser = Object.keys(users).find((key) => users[key] === socket.id);
    if (disconnectedUser) {
      delete users[disconnectedUser];
      console.log(`❌ User ${disconnectedUser} disconnected`);
    } else {
      console.log(`❌ Unknown socket ${socket.id} disconnected`);
    }
  });
});
  
  
app.use("/api/payment/webhook", bodyParser.raw({ type: "application/json" }));

// Middleware setup
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
//app.use(cors({ origin: '*' })); // Allow all (use only if necessary)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads'));



// Register route middlewares
app.use('/user', UserRouter);
// -> original app.use('/product', ProductRouter);
app.use('/product', ProductRouter);
app.use('/contact', ContactRouter);
app.use('/util', UtilRouter);
app.use("/api/orders", orderRouter);
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/artisan", artisanRouter);
app.use("/api/customer", customerRouter);
app.use("/api/coupons", couponRoutes);

// Payment Route
app.post('/create-checkout-session', async (req, res) => {
    try {
        console.log("Received Checkout Request:", req.body);

        const { cartItems, userDetails } = req.body;

        if (!cartItems || !userDetails) {
            console.error("❌ Missing required fields");
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log("✅ Cart Items:", cartItems);
        console.log("✅ User Details:", userDetails);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: cartItems.map(item => ({
                price_data: {
                    currency: 'inr',
                    product_data: { name: item.title },
                    unit_amount: (item.discountedPrice || item.price) * 100, // 💥 apply discount if present
                 
                },
                quantity: item.quantity,
                
            })),
            mode: 'payment',
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/cancel',
            metadata: {
                userDetails: JSON.stringify(userDetails),
            },
        });

        console.log("✅ Stripe Session Created:", session);
        res.json({ id: session.id, url: session.url });

    } catch (error) {
        console.error('❌ Stripe Checkout Error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});


// Basic Routes
app.get('/', (req, res) => res.send('Server is running successfully 🚀'));

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
server.listen(port, () => {
    console.log(`🚀 Server running with Socket.IO on http://localhost:${port}`);
});



