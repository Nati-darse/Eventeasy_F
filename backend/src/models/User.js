const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * User Model Schema
 * Defines the structure and methods for user documents
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address',
    ],
  },

  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password not required for Google users
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password in queries by default
  },

  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true, // Allow multiple null values
  },

  role: {
    type: String,
    enum: {
      values: ['attendee', 'organizer', 'admin', 'super_admin'],
      message: 'Role must be attendee, organizer, admin, or super_admin',
    },
    default: 'attendee',
    required: true,
  },

  // Admin permissions for regular admins
  adminPermissions: {
    canManageUsers: { type: Boolean, default: false },
    canManageEvents: { type: Boolean, default: false },
    canManageReports: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canModerateContent: { type: Boolean, default: false },
  },

  profilePicture: {
    public_id: String,
    url: String,
  },

  bankAccount: {
    account_name: String,
    account_number: String,
    bank_code: String,
  },

  // Email verification fields
  isVerified: {
    type: Boolean,
    default: false,
  },

  verifyOtp: {
    type: String,
    select: false,
  },

  verifyOtpExpires: {
    type: Date,
    select: false,
  },

  // Password reset fields
  resetOtp: {
    type: String,
    select: false,
  },

  resetOtpExpires: {
    type: Date,
    select: false,
  },

  // User preferences
  preferences: {
    categories: [{
      type: String,
      enum: [
        'Educational/Academic Events',
        'Social & Cultural Events',
        'Sports & Recreational Events',
        'Entertainment Events',
        'Professional & Educational Events',
        'religous',
      ],
    }],
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    language: {
      type: String,
      enum: ['en', 'am'],
      default: 'en',
    },
  },

  // Activity tracking
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true,
  },

  // Admin management fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  isSuspended: {
    type: Boolean,
    default: false,
  },

  suspensionReason: String,

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

/**
 * Pre-save middleware to hash password
 */
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and exists
  if (!this.isModified('password') || !this.password) return next();

  try {
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} Password match result
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method to generate JWT token
 * @returns {string} JWT token
 */
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Instance method to generate OTP
 * @returns {string} 6-digit OTP
 */
userSchema.methods.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Instance method to set verification OTP
 * @returns {string} Generated OTP
 */
userSchema.methods.setVerificationOTP = function() {
  const otp = this.generateOTP();
  this.verifyOtp = otp;
  this.verifyOtpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return otp;
};

/**
 * Instance method to set password reset OTP
 * @returns {string} Generated OTP
 */
userSchema.methods.setPasswordResetOTP = function() {
  const otp = this.generateOTP();
  this.resetOtp = otp;
  this.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

/**
 * Instance method to verify OTP
 * @param {string} otp - OTP to verify
 * @param {string} type - Type of OTP ('verify' or 'reset')
 * @returns {boolean} Verification result
 */
userSchema.methods.verifyOTP = function(otp, type = 'verify') {
  const otpField = type === 'verify' ? 'verifyOtp' : 'resetOtp';
  const expiresField = type === 'verify' ? 'verifyOtpExpires' : 'resetOtpExpires';

  return this[otpField] === otp && this[expiresField] > new Date();
};

/**
 * Instance method to clear OTP fields
 * @param {string} type - Type of OTP to clear ('verify' or 'reset')
 */
userSchema.methods.clearOTP = function(type = 'verify') {
  if (type === 'verify') {
    this.verifyOtp = undefined;
    this.verifyOtpExpires = undefined;
  } else {
    this.resetOtp = undefined;
    this.resetOtpExpires = undefined;
  }
};

/**
 * Instance method to check if user has admin permission
 * @param {string} permission - Permission to check
 * @returns {boolean} Whether user has permission
 */
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  if (this.role !== 'admin') return false;
  return this.adminPermissions[permission] || false;
};

/**
 * Virtual for user's full profile
 */
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profilePicture: this.profilePicture,
    isVerified: this.isVerified,
    preferences: this.preferences,
    adminPermissions: this.adminPermissions,
    createdAt: this.createdAt,
  };
});

/**
 * Static method to find user by email
 * @param {string} email - User email
 * @returns {Promise<User>} User document
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Static method to find user by Google ID
 * @param {string} googleId - Google ID
 * @returns {Promise<User>} User document
 */
userSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId });
};

/**
 * Static method to find verified users
 * @returns {Promise<User[]>} Array of verified users
 */
userSchema.statics.findVerifiedUsers = function() {
  return this.find({ isVerified: true });
};

module.exports = mongoose.model('User', userSchema, 'Users');