const mongoose = require('mongoose');

const url = "mongodb://127.0.0.1:27017/craftizen"; // Use 127.0.0.1 instead of localhost for reliability

// Connect to MongoDB
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ Connected to MongoDB successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("MongoDB is connected.");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected.");
});

module.exports = mongoose;
