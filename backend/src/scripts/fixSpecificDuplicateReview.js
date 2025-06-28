const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Review model
const Review = require('../models/reviewModel');

async function fixSpecificDuplicateReview() {
  try {
    console.log('🔍 Fixing specific duplicate review...');
    
    const eventId = "682497639409f1bba4301a59";
    const userId = "68262a5b649800d73b3a541b";
    
    console.log(`📝 Looking for reviews by user ${userId} for event ${eventId}`);
    
    // Find all reviews for this specific event-user combination
    const reviews = await Review.find({
      eventId: eventId,
      userId: userId
    }).sort({ createdAt: -1 }); // Sort by creation date (newest first)
    
    console.log(`📊 Found ${reviews.length} reviews for this event-user combination`);
    
    if (reviews.length > 1) {
      console.log('🗑️ Removing duplicate reviews...');
      
      // Keep the most recent review, delete the rest
      const reviewsToDelete = reviews.slice(1);
      
      for (const review of reviewsToDelete) {
        console.log(`   - Deleting review ID: ${review._id}`);
        console.log(`     Rating: ${review.rating}, Comment: ${review.comment?.substring(0, 50)}...`);
        console.log(`     Created: ${review.createdAt}`);
        
        await Review.findByIdAndDelete(review._id);
      }
      
      console.log(`✅ Deleted ${reviewsToDelete.length} duplicate reviews`);
      console.log(`✅ Kept the most recent review (ID: ${reviews[0]._id})`);
      
    } else if (reviews.length === 1) {
      console.log('✅ Only one review found - no duplicates');
    } else {
      console.log('⚠️ No reviews found for this event-user combination');
    }
    
    // Also check for any other duplicate reviews in the database
    console.log('\n🔍 Checking for other duplicate reviews...');
    
    const allDuplicates = await Review.aggregate([
      {
        $group: {
          _id: {
            eventId: '$eventId',
            userId: '$userId'
          },
          count: { $sum: 1 },
          reviewIds: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    if (allDuplicates.length > 0) {
      console.log(`⚠️ Found ${allDuplicates.length} other duplicate review combinations:`);
      
      for (const duplicate of allDuplicates) {
        console.log(`   - Event: ${duplicate._id.eventId}, User: ${duplicate._id.userId} (${duplicate.count} reviews)`);
        
        // Delete all but the first review for each duplicate
        const reviewsToDelete = duplicate.reviewIds.slice(1);
        for (const reviewId of reviewsToDelete) {
          await Review.findByIdAndDelete(reviewId);
        }
      }
      
      console.log(`✅ Cleaned up ${allDuplicates.length} duplicate review groups`);
    } else {
      console.log('✅ No other duplicate reviews found');
    }
    
    console.log('🎉 Duplicate review fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing duplicate review:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
  }
}

// Run the fix
fixSpecificDuplicateReview(); 