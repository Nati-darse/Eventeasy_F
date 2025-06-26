const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const emailConfig = require('../config/email');

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
      const token = user.generateAuthToken();

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
}

module.exports = AuthController;