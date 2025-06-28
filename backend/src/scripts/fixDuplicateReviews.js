const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Review model
const Review = require('../models/reviewModel');

async function fixDuplicateReviews() {
  try {
    console.log('🔍 Checking for duplicate reviews...');
    
    // Find duplicate reviews using aggregation
    const duplicates = await Review.aggregate([
      {
        $group: {
          _id: {
            eventId: '$eventId',
            userId: '$userId'
          },
          count: { $sum: 1 },
          reviews: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    console.log(`📊 Found ${duplicates.length} duplicate review groups`);
    
    if (duplicates.length > 0) {
      console.log('🗑️ Removing duplicate reviews...');
      
      let totalDeleted = 0;
      
      for (const duplicate of duplicates) {
        const { eventId, userId } = duplicate._id;
        const reviews = duplicate.reviews;
        
        console.log(`\n📝 Event: ${eventId}, User: ${userId}`);
        console.log(`   Found ${reviews.length} reviews, keeping the most recent one`);
        
        // Sort reviews by creation date (newest first)
        const sortedReviews = reviews.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Keep the most recent review, delete the rest
        const reviewsToDelete = sortedReviews.slice(1);
        
        for (const review of reviewsToDelete) {
          console.log(`   - Deleting review ID: ${review._id} (created: ${review.createdAt})`);
          await Review.findByIdAndDelete(review._id);
          totalDeleted++;
        }
      }
      
      console.log(`\n✅ Deleted ${totalDeleted} duplicate reviews`);
      
    } else {
      console.log('✅ No duplicate reviews found');
    }
    
    // Verify the fix by checking if unique index can be created
    console.log('\n🔍 Verifying fix...');
    
    try {
      // Try to create the unique index (it should work now)
      await mongoose.connection.db.collection('reviews').createIndex(
        { eventId: 1, userId: 1 }, 
        { unique: true }
      );
      console.log('✅ Unique index created successfully - no more duplicates!');
    } catch (indexError) {
      console.error('❌ Still have duplicate reviews:', indexError.message);
    }
    
    console.log('🎉 Duplicate reviews fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing duplicate reviews:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
  }
}

// Run the fix
fixDuplicateReviews(); 