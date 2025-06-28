const express = require('express');
const { getUserById, getCurrentUser } = require('../controllers/userController');
const userAuth = require('../middlewares/userAuth');

const userRouter = express.Router();

// Route to get current user details
userRouter.get('/data', userAuth, getCurrentUser);

// Route to get user details by ID
userRouter.get('/data/:id', userAuth, getUserById);

module.exports = userRouter;