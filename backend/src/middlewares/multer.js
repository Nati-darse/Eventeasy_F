const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'Event-Easy', // Optional: use "Event-Easy/images" or "videos"
      resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // optional custom name
    };
  },
});

const upload = multer({ storage });

module.exports = upload;