const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

/**
 * Security Middleware
 * Implements various security measures
 */

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.cloudinary.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Data sanitization against NoSQL query injection
const mongoSanitization = mongoSanitize();

// Data sanitization against XSS
const xssProtection = xss();

// Prevent parameter pollution
const parameterPollution = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'status'],
});

// Custom security middleware
const customSecurity = (req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// Input validation middleware
const validateInput = (req, res, next) => {
  // Check for common malicious patterns
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return maliciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected',
    });
  }

  next();
};

module.exports = {
  securityHeaders,
  mongoSanitization,
  xssProtection,
  parameterPollution,
  customSecurity,
  validateInput,
};