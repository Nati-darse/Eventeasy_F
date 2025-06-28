const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Event model
const Event = require('../models/Event');

async function fixGeospatialIndex() {
  try {
    console.log('🔍 Checking for events with empty coordinates...');
    
    // Find events with empty coordinates
    const eventsWithEmptyCoords = await Event.find({
      "location.coordinates": { $size: 0 }
    });
    
    console.log(`📊 Found ${eventsWithEmptyCoords.length} events with empty coordinates`);
    
    if (eventsWithEmptyCoords.length > 0) {
      console.log('🗑️ Deleting events with empty coordinates...');
      
      // Delete events with empty coordinates
      const result = await Event.deleteMany({
        "location.coordinates": { $size: 0 }
      });
      
      console.log(`✅ Deleted ${result.deletedCount} events with empty coordinates`);
      
      // Show details of deleted events
      eventsWithEmptyCoords.forEach(event => {
        console.log(`   - Deleted: "${event.eventName}" (ID: ${event._id})`);
      });
    } else {
      console.log('✅ No events with empty coordinates found');
    }
    
    // Also check for events with invalid coordinates (null, undefined, or non-numeric)
    const eventsWithInvalidCoords = await Event.find({
      $or: [
        { "location.coordinates": null },
        { "location.coordinates": { $exists: false } },
        { "location.coordinates": { $type: "array", $not: { $elemMatch: { $type: "number" } } } }
      ]
    });
    
    console.log(`📊 Found ${eventsWithInvalidCoords.length} events with invalid coordinates`);
    
    if (eventsWithInvalidCoords.length > 0) {
      console.log('🗑️ Deleting events with invalid coordinates...');
      
      const result = await Event.deleteMany({
        $or: [
          { "location.coordinates": null },
          { "location.coordinates": { $exists: false } },
          { "location.coordinates": { $type: "array", $not: { $elemMatch: { $type: "number" } } } }
        ]
      });
      
      console.log(`✅ Deleted ${result.deletedCount} events with invalid coordinates`);
      
      eventsWithInvalidCoords.forEach(event => {
        console.log(`   - Deleted: "${event.eventName}" (ID: ${event._id})`);
      });
    }
    
    console.log('🎉 Geospatial index fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing geospatial index:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
  }
}

// Run the fix
fixGeospatialIndex(); 