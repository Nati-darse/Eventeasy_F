const cloudinary = require('cloudinary').v2;
require('dotenv').config();

/**
 * Cloudinary Configuration
 * Handles cloud storage setup for media files
 */
class CloudinaryConfig {
  constructor() {
    this.configure();
  }

  /**
   * Configure Cloudinary with environment variables
   * @private
   */
  configure() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log('☁️ Cloudinary configured successfully');
  }

  /**
   * Get cloudinary instance
   * @returns {object} Cloudinary instance
   */
  getInstance() {
    return cloudinary;
  }

  /**
   * Upload file to cloudinary
   * @param {string} filePath - Path to file
   * @param {object} options - Upload options
   * @returns {Promise<object>} Upload result
   */
  async uploadFile(filePath, options = {}) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'Event-Easy',
        ...options,
      });
      return result;
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      throw error;
    }
  }

  /**
   * Delete file from cloudinary
   * @param {string} publicId - Public ID of file to delete
   * @param {object} options - Delete options
   * @returns {Promise<object>} Delete result
   */
  async deleteFile(publicId, options = {}) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, options);
      return result;
    } catch (error) {
      console.error('❌ Cloudinary delete error:', error);
      throw error;
    }
  }
}

module.exports = new CloudinaryConfig();