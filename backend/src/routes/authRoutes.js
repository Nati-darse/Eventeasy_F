const express = require('express');
const AuthController = require('../controllers/authController');
const userAuth = require('../middlewares/userAuth');

const router = express.Router();

// Admin login route
router.post('/admin-login', AuthController.adminLogin);

// Google OAuth routes
router.post('/google', AuthController.googleAuth);
router.post('/link-google', userAuth, AuthController.linkGoogleAccount);

module.exports = router;