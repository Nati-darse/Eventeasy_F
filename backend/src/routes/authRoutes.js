const express = require('express');
const AuthController = require('../controllers/authController');
const userAuth = require('../middlewares/userAuth');

const router = express.Router();

// Google OAuth routes
router.post('/google', AuthController.googleAuth);
router.post('/link-google', userAuth, AuthController.linkGoogleAccount);

module.exports = router;