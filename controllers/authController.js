// oriiginal one
// const User = require("../models/userModel");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// require("dotenv").config(); // Ensure .env is loaded

// // ✅ Debugging: Ensure JWT_SECRET is Loaded
// if (!process.env.JWT_SECRET) {
//   console.error("🔴 JWT_SECRET is missing in .env file");
//   process.exit(1); // Stop execution if missing
// }

// console.log("🔍 Loaded JWT Secret:", process.env.JWT_SECRET);

// // 📌 User Registration
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role, avatar } = req.body;
//     console.log("🔍 Received Registration Request:", req.body);

//     // ✅ Validate required fields
//     if (!name || !email || !password) {
//       console.log("🔴 Missing required fields");
//       return res.status(400).json({ success: false, message: "All fields are required" });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       console.log("🔴 User already exists:", email);
//       return res.status(400).json({ success: false, message: "User already exists" });
//     }

//     // ✅ Ensure password is not undefined
//     if (typeof password !== "string") {
//       console.log("🔴 Password must be a string");
//       return res.status(400).json({ success: false, message: "Invalid password format" });
//     }

//     // Hash password
//     // const hashedPassword = await bcrypt.hash(password, 10);
//     const hashedPassword = await bcrypt.hash(password, 10);
//     console.log("✅ Hashed Password:", hashedPassword);

//     // Create new user
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       role: role || "customer",
//       avatar: avatar || "" // Ensure avatar is included
//     });

//     await newUser.save();
//     console.log("🟢 User Registered Successfully:", newUser.email);

//     res.status(201).json({ success: true, message: "User registered successfully" });
//   } catch (error) {
//     console.error("🔴 Error in registration:", error.message);
//     res.status(500).json({ success: false, message: "Failed to register user", error: error.message });
//   }
// };

// // 📌 User Login
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     console.log("🔍 Received Login Request:", { email, password });

//     // ✅ Validate input
//     if (!email || !password) {
//       console.log("🔴 Missing email or password");
//       return res.status(400).json({ success: false, message: "Email and password are required" });
//     }

//     // Find user in database
//     const user = await User.findOne({ email });
//     if (!user) {
//       console.log("🔴 User not found:", email);
//       return res.status(401).json({ success: false, message: "Invalid email or password" });
//     }

//     console.log("✅ User found:", user);
    
//     // Debug: Check stored password in database
//     console.log("🔍 Stored Hashed Password in DB:", user.password);
//     console.log("🔍 Plain Password Received:", password);



//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log("🔍 Password Check:", isMatch);
//     console.log("🔍 Entered Password:", password);
//     console.log("🔍 Stored Hashed Password in DB:", user.password);
//     console.log("🔍 Password Match:", isMatch);
//     if (!isMatch) {
//       console.log("🔴 Invalid password for:", email);
//       return res.status(401).json({ success: false, message: "Invalid email or password" });
//     }

//     console.log("✅ Using JWT_SECRET:", process.env.JWT_SECRET);

//     // ✅ Ensure JWT_SECRET exists
//     if (!process.env.JWT_SECRET) {
//       console.error("🔴 JWT_SECRET is missing in .env");
//       return res.status(500).json({ success: false, message: "Internal Server Error: JWT_SECRET missing" });
//     }

//     const expiresIn = "7d"; // Token expiration (1 hour)
//     console.log("⚡ Generating JWT Token for User ID:", user._id);
    
//     let token;
//     try {
//       token = jwt.sign(
//         { id: user._id, email: user.email, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn }
//       );

//       console.log("🟢 Generated Token Successfully");
//     } catch (error) {
//       console.error("🔴 JWT Error:", error.message);
//       return res.status(500).json({ success: false, message: "Token generation failed", error: error.message });
//     }

//     // ✅ Send token in response
//     res.json({
//       success: true,
//       message: "Login successful",
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         avatar: user.avatar || "",
//       },
//       token: token, // Ensure token is returned
//       expiresIn: expiresIn, // Optional but useful
//     });
//   } catch (error) {
//     console.error("🔴 Server Error:", error.message);
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };

// // 📌 User Logout (Frontend will handle token removal)
// const logoutUser = async (req, res) => {
//   try {
//     res.status(200).json({ success: true, message: "Logout successful" });
//   } catch (error) {
//     console.error("🔴 Error in logout:", error.message);
//     res.status(500).json({ success: false, message: "Failed to logout", error: error.message });
//   }
// };

// module.exports = { registerUser, loginUser, logoutUser };


// Admin panel

const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendPasswordResetEmail = require("../utils/sendPasswordResetEmail"); // Import the email utility function
require("dotenv").config();

// Validate JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error("🔴 JWT_SECRET missing in .env");
  process.exit(1);
}

// ✅ Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = "customer", avatar = "" } = req.body;
    console.log("🔍 Received Registration Request:", req.body);

    if (!name || !email || !password) {
      console.log("🔴 Missing required fields");
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("🔴 User already exists:", email);
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Hashed Password:", hashedPassword);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role, // Accepts 'admin', 'artisan', or 'customer'
      avatar
    });

    await newUser.save();
    console.log("🟢 User Registered Successfully:", newUser.email);

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

// ✅ Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔍 Received Login Request:", { email, password });

    if (!email || !password) {
      console.log("🔍 Received Login Request:", { email, password });
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    console.log("🔍 User found:", user);
    console.log("🔍 Stored Hashed Password in DB:", user.password);
    console.log("🔍 Plain Password Received:", password);


    if (!user) {
      console.log("�� User not found:", email);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password Check:", isMatch);
     console.log("🔍 Entered Password:", password);
     console.log("🔍 Stored Hashed Password in DB:", user.password);
     console.log("🔍 Password Match:", isMatch);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log("✅ Using JWT_SECRET:", process.env.JWT_SECRET);
    console.log("��� Generated JWT Token Successfully");
    console.log("🔍 Generated JWT Token:", token);
    console.log("🔍 User ID:", user._id); 
    console.log("🔍 User Email:", user.email);
    console.log("🔍 User Role:", user.role);
    console.log("�� User Avatar:", user.avatar);
    console.log("��� Generated JWT Token for User ID:", user._id);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        role: user.role,
        
      },
      token,
      expiresIn: "7d"
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

// ✅ Logout (handled on frontend)
const logoutUser = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error.message);
    res.status(500).json({ success: false, message: "Logout failed", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📩 Forgot Password Request Received for:", email);

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("🔴 No user found with email:", email);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔐 Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // ⏳ Set token & expiry (valid for 1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    // 📨 Send email to user with the reset link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    console.log("📨 Password Reset Link:", resetLink);

    await sendPasswordResetEmail(user.email, resetLink); // Send the reset email

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { registerUser, loginUser, logoutUser, forgotPassword };
