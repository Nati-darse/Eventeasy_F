const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Models
const Event = require('../models/Event');
const Review = require('../models/reviewModel');

async function fixAllDatabaseIssues() {
  try {
    console.log('🔧 Starting comprehensive database fix...\n');

    // Step 1: Fix geospatial issues
    console.log('📍 Step 1: Fixing geospatial index issues...');
    
    // Find all events with invalid location structures
    const eventsWithInvalidLocation = await Event.find({
      $or: [
        { "location.coordinates": { $size: 0 } },
        { "location.coordinates": null },
        { "location.coordinates": { $exists: false } },
        { "location.address": { $exists: true } } // Events with address field in location
      ]
    });

    console.log(`📊 Found ${eventsWithInvalidLocation.length} events with invalid location structures`);

    for (const event of eventsWithInvalidLocation) {
      console.log(`   - Fixing: "${event.eventName}" (ID: ${event._id})`);
      console.log(`     Current location:`, event.location);

      // Fix the location structure to proper GeoJSON format
      const fixedLocation = {
        type: "Point",
        coordinates: [38.7636, 9.1450] // Addis Ababa coordinates
      };

      await Event.findByIdAndUpdate(
        event._id,
        {
          $set: { location: fixedLocation }
        }
      );

      console.log(`     ✅ Fixed location structure`);
    }

    // Step 2: Fix duplicate reviews
    console.log('\n📝 Step 2: Fixing duplicate reviews...');
    
    // Find all duplicate reviews
    const duplicateReviews = await Review.aggregate([
      {
        $group: {
          _id: { eventId: "$eventId", userId: "$userId" },
          count: { $sum: 1 },
          reviews: { $push: "$$ROOT" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    console.log(`📊 Found ${duplicateReviews.length} duplicate review groups`);

    for (const duplicate of duplicateReviews) {
      console.log(`   - Event: ${duplicate._id.eventId}, User: ${duplicate._id.userId}`);
      console.log(`     Found ${duplicate.count} duplicate reviews`);

      // Keep the most recent review, delete the rest
      const sortedReviews = duplicate.reviews.sort((a, b) => 
        new Date(b.createdAt || b._id.getTimestamp()) - new Date(a.createdAt || a._id.getTimestamp())
      );

      const reviewsToDelete = sortedReviews.slice(1); // Keep first (most recent), delete the rest

      for (const review of reviewsToDelete) {
        console.log(`     🗑️ Deleting duplicate review: ${review._id}`);
        await Review.findByIdAndDelete(review._id);
      }
    }

    // Step 3: Verify fixes
    console.log('\n🔍 Step 3: Verifying fixes...');

    // Check for remaining invalid locations
    const remainingInvalidLocations = await Event.find({
      $or: [
        { "location.coordinates": { $size: 0 } },
        { "location.coordinates": null },
        { "location.coordinates": { $exists: false } },
        { "location.address": { $exists: true } }
      ]
    });

    if (remainingInvalidLocations.length > 0) {
      console.log(`⚠️ Still have ${remainingInvalidLocations.length} events with invalid locations:`);
      remainingInvalidLocations.forEach(event => {
        console.log(`   - "${event.eventName}" (ID: ${event._id}):`, event.location);
      });
    } else {
      console.log('✅ All events have valid location structures');
    }

    // Check for remaining duplicate reviews
    const remainingDuplicates = await Review.aggregate([
      {
        $group: {
          _id: { eventId: "$eventId", userId: "$userId" },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (remainingDuplicates.length > 0) {
      console.log(`⚠️ Still have ${remainingDuplicates.length} duplicate review groups`);
    } else {
      console.log('✅ All duplicate reviews have been removed');
    }

    // Step 4: Recreate indexes
    console.log('\n🔧 Step 4: Recreating database indexes...');

    try {
      // Drop existing indexes
      try {
        await mongoose.connection.db.collection('events').dropIndex('location_2dsphere');
        console.log('🗑️ Dropped existing geospatial index');
      } catch (dropError) {
        // Index doesn't exist, that's fine
      }

      try {
        await mongoose.connection.db.collection('reviews').dropIndex('eventId_1_userId_1');
        console.log('🗑️ Dropped existing review index');
      } catch (dropError) {
        // Index doesn't exist, that's fine
      }

      // Create geospatial index
      await mongoose.connection.db.collection('events').createIndex(
        { location: '2dsphere' },
        { name: 'location_2dsphere' }
      );
      console.log('✅ Geospatial index created successfully');

      // Create review index
      await mongoose.connection.db.collection('reviews').createIndex(
        { eventId: 1, userId: 1 },
        { unique: true, name: 'eventId_1_userId_1' }
      );
      console.log('✅ Review index created successfully');

    } catch (indexError) {
      console.error('❌ Error creating indexes:', indexError.message);
    }

    console.log('\n🎉 Database fix completed successfully!');

  } catch (error) {
    console.error('❌ Error during database fix:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
  }
}

// Run the fix
fixAllDatabaseIssues(); 