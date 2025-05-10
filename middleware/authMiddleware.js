// original one
// const jwt = require("jsonwebtoken");
// const User = require("../models/userModel");
// require("dotenv").config();

// // Debugging: Check if JWT_SECRET is loaded
// console.log("🔍 Loaded JWT Secret:", process.env.JWT_SECRET);

// const authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     console.log("🔍 Full Authorization Header:", authHeader);

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       console.log("🔴 No token provided or incorrect format");
//       return res.status(401).json({ message: "Unauthorized: No token provided" });
//     }

//     // const token = authHeader.split(" ")[1]; // Extract token
//     const token = req.headers.authorization?.replace("Bearer ", "").trim();
//     console.log(req.headers.authorization); // Debugging



//     console.log("🟢 Extracted Token:", token);

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("🟢 Decoded User:", decoded);

//     if (!decoded.id) {
//       console.log("🔴 Invalid token: Missing user ID");
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     // Fetch user from database
//     req.user = await User.findById(decoded.id).select("-password");
//     console.log("🟢 Authenticated User:", req.user);

//     if (!req.user) {
//       console.log("🔴 User not found in database");
//       return res.status(401).json({ message: "User not found" });
//     }

//     next(); // Proceed to next middleware
//   } catch (error) {
//     console.error("🔴 Token verification failed:", error.message);

//     if (error instanceof jwt.TokenExpiredError) {
//       return res.status(401).json({ message: "Session expired, please log in again" });
//     }
//     if (error instanceof jwt.JsonWebTokenError) {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     res.status(500).json({ message: "Authentication error" });
//   }
// };

// // ✅ Add isAdmin middleware
// const isAdmin = (req, res, next) => {
//   if (!req.user || req.user.role !== "admin") {
//     console.log("🔴 Access denied: Not an admin");
//     return res.status(403).json({ message: "Access denied: Admins only" });
//   }
//   console.log("🟢 Admin access granted");
//   next();
// };

// module.exports = { authMiddleware, isAdmin };

// admin panel

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

// 🔐 Authenticate User
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token", error: error.message });
  }
};

// 🎯 Authorize Roles (for specific role-based access)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied: Only [${allowedRoles.join(", ")}] can access this route`,
      });
    }
    next();
  };
};

module.exports = { authMiddleware, authorizeRoles };
