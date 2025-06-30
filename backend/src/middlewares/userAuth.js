const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Make sure to import your User model

const userAuth = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  console.log("Token received:", token);

  if (!token) {
    console.log("No token found in cookies or header");
    return res.status(401).json({ message: "Not Authorized Login Again" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch the user from the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user; // Attach the full user object to req.user
    next();
  } catch (err) {
    console.log("JWT error:", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = userAuth;