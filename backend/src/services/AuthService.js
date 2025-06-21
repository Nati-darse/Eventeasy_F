const User = require('../models/User');
const emailConfig = require('../config/email');

/**
 * Authentication Service
 * Handles user authentication operations
 */
class AuthService {
  /**
   * Register a new user
   * @param {object} userData - User registration data
   * @returns {Promise<object>} Registration result
   */
  static async registerUser(userData) {
    try {
      const { name, email, password, role } = userData;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase(),
        password,
        role,
      });

      await user.save();

      // Generate JWT token
      const token = user.generateAuthToken();

      // Send welcome email
      try {
        await emailConfig.sendWelcomeEmail(user.email, user.name);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }

      return {
        success: true,
        message: 'User registered successfully',
        user: user.profile,
        token,
      };
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Login user
   * @param {object} credentials - User login credentials
   * @returns {Promise<object>} Login result
   */
  static async loginUser(credentials) {
    try {
      const { email, password } = credentials;

      // Find user with password field
      const user = await User.findByEmail(email).select('+password');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = user.generateAuthToken();

      return {
        success: true,
        message: 'Login successful',
        user: user.profile,
        token,
      };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Send verification OTP
   * @param {string} email - User email
   * @returns {Promise<object>} Send result
   */
  static async sendVerificationOTP(email) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('User is already verified');
      }

      // Generate and set OTP
      const otp = user.setVerificationOTP();
      await user.save();

      // Send OTP email
      await emailConfig.sendOTPEmail(user.email, otp);

      return {
        success: true,
        message: 'Verification OTP sent successfully',
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to send verification OTP');
    }
  }

  /**
   * Verify OTP
   * @param {string} userId - User ID
   * @param {string} otp - OTP to verify
   * @returns {Promise<object>} Verification result
   */
  static async verifyOTP(userId, otp) {
    try {
      const user = await User.findById(userId).select('+verifyOtp +verifyOtpExpires');
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('User is already verified');
      }

      // Verify OTP
      if (!user.verifyOTP(otp, 'verify')) {
        throw new Error('Invalid or expired OTP');
      }

      // Mark user as verified and clear OTP
      user.isVerified = true;
      user.clearOTP('verify');
      await user.save();

      return {
        success: true,
        message: 'Email verified successfully',
        user: user.profile,
      };
    } catch (error) {
      throw new Error(error.message || 'OTP verification failed');
    }
  }

  /**
   * Send password reset OTP
   * @param {string} email - User email
   * @returns {Promise<object>} Send result
   */
  static async sendPasswordResetOTP(email) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate and set reset OTP
      const otp = user.setPasswordResetOTP();
      await user.save();

      // Send reset OTP email
      await emailConfig.sendOTPEmail(user.email, otp);

      return {
        success: true,
        message: 'Password reset OTP sent successfully',
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to send password reset OTP');
    }
  }

  /**
   * Reset password
   * @param {string} email - User email
   * @param {string} otp - Reset OTP
   * @param {string} newPassword - New password
   * @returns {Promise<object>} Reset result
   */
  static async resetPassword(email, otp, newPassword) {
    try {
      const user = await User.findByEmail(email).select('+resetOtp +resetOtpExpires');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify reset OTP
      if (!user.verifyOTP(otp, 'reset')) {
        throw new Error('Invalid or expired reset OTP');
      }

      // Update password and clear reset OTP
      user.password = newPassword;
      user.clearOTP('reset');
      await user.save();

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<object>} User profile
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: user.profile,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to get user profile');
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {object} updateData - Data to update
   * @returns {Promise<object>} Update result
   */
  static async updateUserProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update allowed fields
      const allowedFields = ['name', 'preferences', 'profilePicture'];
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          user[key] = updateData[key];
        }
      });

      await user.save();

      return {
        success: true,
        message: 'Profile updated successfully',
        user: user.profile,
      };
    } catch (error) {
      throw new Error(error.message || 'Profile update failed');
    }
  }
}

module.exports = AuthService;