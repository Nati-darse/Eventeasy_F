const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Models
const User = require('../models/User');
const Event = require('../models/Event');
const Review = require('../models/reviewModel');
const Payment = require('../models/paymentModel');
const Report = require('../models/reportModel');

async function checkAllDuplicates() {
  try {
    console.log('🔍 Checking for duplicate key issues across all collections...\n');
    
    // Check Users collection (email should be unique)
    console.log('👥 Checking Users collection...');
    const duplicateEmails = await User.aggregate([
      {
        $group: {
          _id: '$email',
          count: { $sum: 1 },
          users: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    if (duplicateEmails.length > 0) {
      console.log(`❌ Found ${duplicateEmails.length} duplicate email addresses`);
      duplicateEmails.forEach(dup => {
        console.log(`   - Email: ${dup._id} (${dup.count} users)`);
      });
    } else {
      console.log('✅ No duplicate emails found');
    }
    
    // Check Payments collection (txRef should be unique)
    console.log('\n💳 Checking Payments collection...');
    const duplicateTxRefs = await Payment.aggregate([
      {
        $group: {
          _id: '$txRef',
          count: { $sum: 1 },
          payments: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    if (duplicateTxRefs.length > 0) {
      console.log(`❌ Found ${duplicateTxRefs.length} duplicate transaction references`);
      duplicateTxRefs.forEach(dup => {
        console.log(`   - TxRef: ${dup._id} (${dup.count} payments)`);
      });
    } else {
      console.log('✅ No duplicate transaction references found');
    }
    
    // Check Reviews collection (eventId + userId should be unique)
    console.log('\n⭐ Checking Reviews collection...');
    const duplicateReviews = await Review.aggregate([
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
    
    if (duplicateReviews.length > 0) {
      console.log(`❌ Found ${duplicateReviews.length} duplicate review combinations`);
      duplicateReviews.forEach(dup => {
        console.log(`   - Event: ${dup._id.eventId}, User: ${dup._id.userId} (${dup.count} reviews)`);
      });
    } else {
      console.log('✅ No duplicate reviews found');
    }
    
    // Check Events collection (no unique constraints, but check for potential issues)
    console.log('\n🎉 Checking Events collection...');
    const eventsWithEmptyCoords = await Event.countDocuments({
      "location.coordinates": { $size: 0 }
    });
    
    if (eventsWithEmptyCoords > 0) {
      console.log(`⚠️ Found ${eventsWithEmptyCoords} events with empty coordinates`);
    } else {
      console.log('✅ No events with empty coordinates');
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - Duplicate emails: ${duplicateEmails.length}`);
    console.log(`   - Duplicate txRefs: ${duplicateTxRefs.length}`);
    console.log(`   - Duplicate reviews: ${duplicateReviews.length}`);
    console.log(`   - Events with empty coords: ${eventsWithEmptyCoords}`);
    
    const totalIssues = duplicateEmails.length + duplicateTxRefs.length + duplicateReviews.length + eventsWithEmptyCoords;
    
    if (totalIssues > 0) {
      console.log(`\n⚠️ Total issues found: ${totalIssues}`);
      console.log('💡 Run the specific fix scripts to resolve these issues');
    } else {
      console.log('\n🎉 No duplicate key issues found!');
    }
    
  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 MongoDB connection closed');
  }
}

// Run the check
checkAllDuplicates(); 