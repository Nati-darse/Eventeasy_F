const express = require('express');
const { createOrUpdateReview, getEventReviews } = require('../controllers/reviewController');
const userAuth = require('../middlewares/userAuth');

const router = express.Router();

router.post('/:eventId/review', userAuth, createOrUpdateReview);
router.get('/:eventId/reviews', getEventReviews);

module.exports = router;