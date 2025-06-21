const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  console.log("Token received:", token);

  if (!token) {
    console.log("No token found in cookies or header");
    return res.status(401).json({ message: "Not Authorized Login Again" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id }; // <- ✅ Store in req.user, not req.body
    next();
  } catch (err) {
    console.log("JWT error:", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = userAuth;