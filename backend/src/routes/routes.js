const express = require("express");
const { registerUser, loginUser, logoutUser, sendVerifyOtp, verifyOtp, isAuthenticated, getAllUsers, getUserById } = require("../controllers/userController");
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

// POST /api/users/register
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/send-verify-otp", userAuth, sendVerifyOtp);
router.post("/verify-otp", userAuth, verifyOtp); // Assuming you want to use the same route for verification
router.get("/is-auth", userAuth, isAuthenticated);
router.get("/users", userAuth, getAllUsers); // Assuming you want to get all users
router.get("/user/:id", userAuth, getUserById); // Assuming you want to get a user by ID

module.exports = router;