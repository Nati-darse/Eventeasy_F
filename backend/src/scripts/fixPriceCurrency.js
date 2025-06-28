const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

const fixPriceCurrency = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all events with invalid price.currency
    const events = await Event.find({
      $or: [
        { 'price.currency': { $exists: false } },
        { 'price.currency': { $type: 'array' } },
        { 'price.currency': null }
      ]
    });

    console.log(`Found ${events.length} events with invalid price.currency`);

    // Fix each event
    for (const event of events) {
      console.log(`Fixing event: ${event.eventName} (${event._id})`);
      
      // Set default price structure if it doesn't exist
      if (!event.price) {
        event.price = {
          amount: 0,
          currency: 'ETB'
        };
      } else {
        // Fix currency field
        if (Array.isArray(event.price.currency)) {
          event.price.currency = 'ETB';
        } else if (!event.price.currency || typeof event.price.currency !== 'string') {
          event.price.currency = 'ETB';
        }
        
        // Ensure amount is a number
        if (typeof event.price.amount !== 'number') {
          event.price.amount = parseFloat(event.price.amount) || 0;
        }
      }

      await event.save();
      console.log(`✅ Fixed event: ${event.eventName}`);
    }

    console.log('🎉 All events fixed successfully!');
    
    // Verify the fix
    const invalidEvents = await Event.find({
      $or: [
        { 'price.currency': { $exists: false } },
        { 'price.currency': { $type: 'array' } },
        { 'price.currency': null }
      ]
    });

    if (invalidEvents.length === 0) {
      console.log('✅ Verification passed: No invalid price.currency found');
    } else {
      console.log(`❌ Verification failed: ${invalidEvents.length} events still have invalid price.currency`);
    }

  } catch (error) {
    console.error('❌ Error fixing price currency:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
fixPriceCurrency(); 