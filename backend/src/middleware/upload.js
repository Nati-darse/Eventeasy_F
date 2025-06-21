const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinaryConfig = require('../config/cloudinary');

/**
 * File Upload Middleware
 * Handles file uploads using Multer and Cloudinary
 */
class UploadMiddleware {
  constructor() {
    this.cloudinary = cloudinaryConfig.getInstance();
    this.storage = this.createCloudinaryStorage();
    this.upload = this.createMulterInstance();
  }

  /**
   * Create Cloudinary storage configuration
   * @private
   * @returns {object} Cloudinary storage instance
   */
  createCloudinaryStorage() {
    return new CloudinaryStorage({
      cloudinary: this.cloudinary,
      params: async (req, file) => {
        const isVideo = file.mimetype.startsWith('video/');
        
        return {
          folder: 'Event-Easy',
          resource_type: isVideo ? 'video' : 'image',
          public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
          allowed_formats: isVideo 
            ? ['mp4', 'avi', 'mov', 'wmv'] 
            : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        };
      },
    });
  }

  /**
   * Create Multer instance with file filtering
   * @private
   * @returns {object} Multer instance
   */
  createMulterInstance() {
    return multer({
      storage: this.storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
      fileFilter: this.fileFilter.bind(this),
    });
  }

  /**
   * File filter function
   * @param {object} req - Express request object
   * @param {object} file - Multer file object
   * @param {function} cb - Callback function
   * @private
   */
  fileFilter(req, file, cb) {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  }

  /**
   * Handle single file upload
   * @param {string} fieldName - Form field name
   * @returns {function} Multer middleware
   */
  single(fieldName) {
    return this.upload.single(fieldName);
  }

  /**
   * Handle multiple file uploads
   * @param {array} fields - Array of field configurations
   * @returns {function} Multer middleware
   */
  fields(fields) {
    return this.upload.fields(fields);
  }

  /**
   * Handle upload errors
   * @param {object} error - Error object
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next function
   */
  static handleUploadError(error, req, res, next) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 50MB.',
        });
      }
      
      return res.status(400).json({
        success: false,
        message: `Upload error: ${error.message}`,
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  }
}

module.exports = new UploadMiddleware();