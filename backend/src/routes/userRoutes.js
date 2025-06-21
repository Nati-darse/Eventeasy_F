const express = require('express');
const { getUserDetails } = require('../controllers/userDetails');
const userAuth = require('../middlewares/userAuth');

const userRouter = express.Router();

// Route to get all users
userRouter.get('/data', userAuth, getUserDetails);

module.exports = userRouter;