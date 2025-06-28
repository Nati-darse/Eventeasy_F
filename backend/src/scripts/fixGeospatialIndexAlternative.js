const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Event model
const Event = require('../models/Event');

async function fixGeospatialIndexAlternative() {
  try {
    console.log('🔍 Checking for events with empty coordinates...');
    
    // Find events with empty coordinates
    const eventsWithEmptyCoords = await Event.find({
      "location.coordinates": { $size: 0 }
    });
    
    console.log(`📊 Found ${eventsWithEmptyCoords.length} events with empty coordinates`);
    
    if (eventsWithEmptyCoords.length > 0) {
      console.log('🔧 Fixing events with empty coordinates...');
      
      // Update events with empty coordinates to have default coordinates (Addis Ababa, Ethiopia)
      const result = await Event.updateMany(
        { "location.coordinates": { $size: 0 } },
        { 
          $set: { 
            "location.coordinates": [38.7636, 9.1450], // Addis Ababa coordinates
            "location.address": "Location not specified"
          } 
        }
      );
      
      console.log(`✅ Fixed ${result.modifiedCount} events with empty coordinates`);
      
      // Show details of fixed events
      eventsWithEmptyCoords.forEach(event => {
        console.log(`   - Fixed: "${event.eventName}" (ID: ${event._id})`);
      });
    } else {
      console.log('✅ No events with empty coordinates found');
    }
    
    // Also check for events with invalid coordinates and fix them
    const eventsWithInvalidCoords = await Event.find({
      $or: [
        { "location.coordinates": null },
        { "location.coordinates": { $exists: false } },
        { "location.coordinates": { $type: "array", $not: { $elemMatch: { $type: "number" } } } }
      ]
    });
    
    console.log(`📊 Found ${eventsWithInvalidCoords.length} events with invalid coordinates`);
    
    if (eventsWithInvalidCoords.length > 0) {
      console.log('🔧 Fixing events with invalid coordinates...');
      
      const result = await Event.updateMany(
        {
          $or: [
            { "location.coordinates": null },
            { "location.coordinates": { $exists: false } },
            { "location.coordinates": { $type: "array", $not: { $elemMatch: { $type: "number" } } } }
          ]
        },
        { 
          $set: { 
            "location.coordinates": [38.7636, 9.1450], // Addis Ababa coordinates
            "location.address": "Location not specified"
          } 
        }
      );
      
      console.log(`✅ Fixed ${result.modifiedCount} events with invalid coordinates`);
      
      eventsWithInvalidCoords.forEach(event => {
        console.log(`   - Fixed: "${event.eventName}" (ID: ${event._id})`);
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
fixGeospatialIndexAlternative(); 