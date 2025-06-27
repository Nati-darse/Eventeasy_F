const Review = require('../models/reviewModel');
const Event = require('../models/Event');
const mongoose = require('mongoose');

/**
 * Review Controller
 * Handles event reviews and ratings
 */
class ReviewController {
  /**
   * Create or update a review
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async createOrUpdateReview(req, res) {
    try {
      const { eventId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      // Validate event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      // Check if user attended the event (optional verification)
      const isAttendee = event.attendees.includes(userId);

      // Find existing review or create new one
      let review = await Review.findOne({ eventId, userId });

      if (review) {
        // Update existing review
        review.rating = rating;
        review.comment = comment;
        review.isVerified = isAttendee;
        await review.save();
      } else {
        // Create new review
        review = new Review({
          eventId,
          userId,
          rating,
          comment,
          isVerified: isAttendee,
        });
        await review.save();
      }

      // Populate user data
      await review.populate('userId', 'name profilePicture');

      res.status(200).json({
        success: true,
        message: review.isNew ? 'Review created successfully' : 'Review updated successfully',
        review,
      });
    } catch (error) {
      console.error('Create/update review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save review',
        error: error.message,
      });
    }
  }

  /**
   * Get reviews for an event
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async getEventReviews(req, res) {
    try {
      const { eventId } = req.params;
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      // Validate event exists
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Get reviews with pagination
      const reviews = await Review.find({ eventId })
        .populate('userId', 'name profilePicture')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Get review statistics
      const stats = await Review.aggregate([
        { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ]);

      // Calculate rating distribution
      let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      if (stats.length > 0) {
        stats[0].ratingDistribution.forEach(rating => {
          ratingDistribution[rating]++;
        });
      }

      const total = await Review.countDocuments({ eventId });

      res.status(200).json({
        success: true,
        data: {
          reviews,
          statistics: {
            totalReviews: stats[0]?.totalReviews || 0,
            averageRating: stats[0]?.averageRating || 0,
            ratingDistribution,
          },
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
          },
        },
      });
    } catch (error) {
      console.error('Get event reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
        error: error.message,
      });
    }
  }

  /**
   * Delete a review
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      // Check if user owns the review or is admin
      if (review.userId.toString() !== userId && !['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this review',
        });
      }

      await Review.findByIdAndDelete(reviewId);

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete review',
        error: error.message,
      });
    }
  }

  /**
   * Vote on review helpfulness
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  static async voteOnReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { helpful } = req.body;
      const userId = req.user.id;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      // Remove existing vote from this user
      review.helpfulVotes = review.helpfulVotes.filter(
        vote => vote.user.toString() !== userId
      );

      // Add new vote
      review.helpfulVotes.push({
        user: userId,
        helpful: helpful,
      });

      await review.save();

      res.status(200).json({
        success: true,
        message: 'Vote recorded successfully',
        helpfulnessScore: review.helpfulnessScore,
      });
    } catch (error) {
      console.error('Vote on review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record vote',
        error: error.message,
      });
    }
  }
}

module.exports = {
  createOrUpdateReview: ReviewController.createOrUpdateReview,
  getEventReviews: ReviewController.getEventReviews,
  deleteReview: ReviewController.deleteReview,
  voteOnReview: ReviewController.voteOnReview,
};