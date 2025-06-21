const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */
class AuthMiddleware {
  /**
   * Verify JWT token and authenticate user
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next function
   */
  static async authenticate(req, res, next) {
    try {
      const token = AuthMiddleware.extractToken(req);

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.',
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found.',
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('🔥 Authentication error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
  }

  /**
   * Extract token from request headers or cookies
   * @param {object} req - Express request object
   * @returns {string|null} JWT token
   * @private
   */
  static extractToken(req) {
    // Check Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      return req.headers.authorization.split(' ')[1];
    }

    // Check cookies
    if (req.cookies?.token) {
      return req.cookies.token;
    }

    return null;
  }

  /**
   * Check if user has required role
   * @param {...string} roles - Required roles
   * @returns {function} Middleware function
   */
  static authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
        });
      }

      next();
    };
  }

  /**
   * Optional authentication - doesn't fail if no token
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next function
   */
  static async optionalAuth(req, res, next) {
    try {
      const token = AuthMiddleware.extractToken(req);

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        req.user = user;
      }

      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  }
}

module.exports = AuthMiddleware;