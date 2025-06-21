const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation Middleware
 * Handles request validation using express-validator
 */
class ValidationMiddleware {
  /**
   * Handle validation errors
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next function
   */
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value,
        })),
      });
    }

    next();
  }

  /**
   * User registration validation rules
   * @returns {array} Validation rules
   */
  static validateUserRegistration() {
    return [
      body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
      
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
      
      body('role')
        .isIn(['attendee', 'organizer'])
        .withMessage('Role must be either attendee or organizer'),
    ];
  }

  /**
   * User login validation rules
   * @returns {array} Validation rules
   */
  static validateUserLogin() {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      
      body('password')
        .notEmpty()
        .withMessage('Password is required'),
    ];
  }

  /**
   * Event creation validation rules
   * @returns {array} Validation rules
   */
  static validateEventCreation() {
    return [
      body('eventName')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Event name must be between 3 and 100 characters'),
      
      body('time')
        .isISO8601()
        .withMessage('Please provide a valid date and time')
        .custom((value) => {
          if (new Date(value) <= new Date()) {
            throw new Error('Event time must be in the future');
          }
          return true;
        }),
      
      body('category')
        .isIn([
          'Educational/Academic Events',
          'Social & Cultural Events',
          'Sports & Recreational Events',
          'Entertainment Events',
          'Professional & Educational Events',
          'religous'
        ])
        .withMessage('Please select a valid category'),
      
      body('pattern')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Pattern must be between 2 and 50 characters'),
      
      body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
      
      body('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
      
      body('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    ];
  }

  /**
   * MongoDB ObjectId validation
   * @param {string} field - Field name to validate
   * @returns {array} Validation rules
   */
  static validateObjectId(field = 'id') {
    return [
      param(field)
        .isMongoId()
        .withMessage(`Invalid ${field} format`),
    ];
  }

  /**
   * Review validation rules
   * @returns {array} Validation rules
   */
  static validateReview() {
    return [
      body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
      
      body('comment')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Comment cannot exceed 500 characters'),
    ];
  }

  /**
   * Report validation rules
   * @returns {array} Validation rules
   */
  static validateReport() {
    return [
      body('reason')
        .isIn([
          'Inappropriate Content',
          'Misleading Information',
          'Safety Concern',
          'Spam',
          'Fraudulent Event',
          'Organizer Issue',
          'Venue Problem',
          'Technical Issue',
          'Other'
        ])
        .withMessage('Please select a valid reason'),
      
      body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    ];
  }
}

module.exports = ValidationMiddleware;