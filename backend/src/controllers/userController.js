const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailConfig = require("../config/email");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists!" });
    }

    // Remove manual hashing, let pre-save middleware handle it
    const user = await User.create({
      name,
      email,
      password, // Pass plain password
      role,
    });

    // Generate OTP and save to user
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send OTP email
    try {
      await emailConfig.sendOTPEmail(user.email, otp);
      console.log("OTP sent to:", email);
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
    }

    return res.status(200).json({ 
      success: true,
      message: "User created successfully. OTP sent to your email.", 
      user: user.profile || user, 
      token 
    });
  } catch (err) {
    console.error("Error creating user:", err);
    return res.status(500).json({ success: false, message: "Error creating user", error: err });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', { email, hasPassword: !!password });
  
  try {
    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required!" 
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ success: false, message: "User not found!" });
    }

    if (!user.isVerified) {
      console.log('❌ User not verified:', email);
      return res.status(400).json({ success: false, message: "Account not verified. Please check your email for the OTP and verify your account before logging in." });
    }

    console.log('👤 User found:', { 
      name: user.name, 
      email: user.email, 
      hasPassword: !!user.password, 
      hasGoogleId: !!user.googleId 
    });

    // Check if user is a Google OAuth user (no password)
    if (!user.password && user.googleId) {
      console.log('❌ Google OAuth user trying to login with password');
      return res.status(400).json({ 
        success: false, 
        message: "This account was created with Google. Please use Google Sign-In instead." 
      });
    }

    // Check if user has no password and is not a Google user
    if (!user.password) {
      console.log('❌ User has no password and is not Google OAuth');
      return res.status(400).json({ 
        success: false, 
        message: "Invalid account. Please contact support." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Invalid password for user:', email);
      return res.status(400).json({ success: false, message: "Invalid credentials!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('✅ Login successful for user:', user.name);

    res.status(200).json({ 
      success: true,
      message: "Login successful", 
      userId: user._id, 
      user: user.profile || user,
      token 
    });
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.status(500).json({ success: false, message: "Server error, try again later!" });
  }
};

// Logout user
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
    });
    return res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server error, try again later!" });
  }
};

// Send OTP for verification
const sendVerifyOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified!" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    try {
      await emailConfig.sendOTPEmail(user.email, otp);
      console.log("OTP sent to:", user.email);
      return res.status(200).json({ success: true, message: "OTP sent successfully!" });
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
      return res.status(500).json({ message: "Error sending OTP email" });
    }
  } catch (error) {
    console.error("Error during OTP generation:", error);
    res.status(500).json({ message: "Server error, try again later!" });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const userId = req.user.id;
  try {
    // Select OTP fields explicitly since they are select: false
    const user = await User.findById(userId).select('+verifyOtp +verifyOtpExpires');
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified!" });
    }
    // Use the model's verifyOTP method for robust checking
    if (!user.verifyOTP(otp, 'verify')) {
      return res.status(400).json({ message: "Invalid or expired OTP!" });
    }
    user.isVerified = true;
    user.clearOTP('verify');
    await user.save();
    return res.status(200).json({ message: "User verified successfully!" });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Server error, try again later!" });
  }
};

// Check if user is authenticated
const isAuthenticated = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -verifyOtp -verifyOtpExpires");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ 
      success: true, 
      message: "User is authenticated!",
      userData: user
    });
  } catch (err) {
    console.log("JWT error:", err.message);
    res.status(401).json({ success: false, message: err.message });
  }
};

// Get current user data
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -verifyOtp -verifyOtpExpires");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
};

// Get all users (admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password -verifyOtp -verifyOtpExpires");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId).select("-password -verifyOtp -verifyOtpExpires");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// Delete user (admin)
const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Update user (admin or self)
const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, password, role } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== userId) {
        return res.status(400).json({ message: "Email already in use by another user!" });
      }
      user.email = email;
    }
    if (name) user.name = name;
    if (role) user.role = role;
    if (password) {
      const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS) || 10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    return res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ message: "Error updating user", error: err });
  }
};

// Google OAuth login/signup
const googleAuth = async (req, res) => {
  try {
    const { credential, role = 'attendee' } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true;
        await user.save();
      }
      user.lastLogin = new Date();
      await user.save();
    } else {
      user = new User({
        name,
        email: email.toLowerCase(),
        googleId,
        role,
        isVerified: true,
        profilePicture: picture ? { url: picture } : undefined,
        lastLogin: new Date(),
      });
      await user.save();
      // Send welcome email (optional)
      try {
        await emailConfig.sendWelcomeEmail(user.email, user.name);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: 'Google authentication successful', user, token });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed', error: error.message });
  }
};

// Link Google account to existing user
const linkGoogleAccount = async (req, res) => {
  try {
    const { credential } = req.body;
    const userId = req.user.id;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, picture } = payload;

    // Check if already linked
    const existingUser = await User.findOne({ googleId });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ success: false, message: 'This Google account is already linked to another user' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.googleId = googleId;
    if (picture && !user.profilePicture?.url) {
      user.profilePicture = { url: picture };
    }
    await user.save();

    res.status(200).json({ success: true, message: 'Google account linked successfully', user });
  } catch (error) {
    console.error('Link Google account error:', error);
    res.status(500).json({ success: false, message: 'Failed to link Google account', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  sendVerifyOtp,
  verifyOtp,
  isAuthenticated,
  getCurrentUser,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  googleAuth,         
  linkGoogleAccount,
};