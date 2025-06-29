const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const emailConfig = require('../config/email');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Google OAuth Controller
 * Handles Google authentication
 */
class AuthController {
  /**
   * Handle Google OAuth login/signup
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async googleAuth(req, res) {
    try {
      const { credential, role = 'attendee' } = req.body;

      if (!credential) {
        return res.status(400).json({
          success: false,
          message: 'Google credential is required',
        });
      }

      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      // Check if user exists
      let user = await User.findOne({
        $or: [
          { googleId },
          { email: email.toLowerCase() }
        ]
      });

      if (user) {
        // Update Google ID if user exists but doesn't have it
        if (!user.googleId) {
          user.googleId = googleId;
          user.isVerified = true; // Google accounts are pre-verified
          await user.save();
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Create new user
        user = new User({
          name,
          email: email.toLowerCase(),
          googleId,
          role,
          isVerified: true, // Google accounts are pre-verified
          profilePicture: picture ? { url: picture } : undefined,
          lastLogin: new Date(),
        });

        await user.save();

        // Send welcome email
        try {
          await emailConfig.sendWelcomeEmail(user.email, user.name);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        user: user.profile,
        token,
      });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Google authentication failed',
        error: error.message,
      });
    }
  }

  /**
   * Link Google account to existing user
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async linkGoogleAccount(req, res) {
    try {
      const { credential } = req.body;
      const userId = req.user.id;

      if (!credential) {
        return res.status(400).json({
          success: false,
          message: 'Google credential is required',
        });
      }

      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, picture } = payload;

      // Check if Google account is already linked to another user
      const existingUser = await User.findOne({ googleId });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({
          success: false,
          message: 'This Google account is already linked to another user',
        });
      }

      // Update current user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      user.googleId = googleId;
      if (picture && !user.profilePicture?.url) {
        user.profilePicture = { url: picture };
      }
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Google account linked successfully',
        user: user.profile,
      });
    } catch (error) {
      console.error('Link Google account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to link Google account',
        error: error.message,
      });
    }
  }

  /**
   * Admin login endpoint
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async adminLogin(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is admin or super admin
      if (!['admin', 'super_admin'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email before logging in'
        });
      }

      // Check if user is suspended
      if (user.isSuspended) {
        return res.status(401).json({
          success: false,
          message: `Account suspended: ${user.suspensionReason || 'No reason provided'}`
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Log admin login
      console.log(`🔐 Admin login: ${user.email} (${user.role})`);

      res.status(200).json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          adminPermissions: user.adminPermissions || {}
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;