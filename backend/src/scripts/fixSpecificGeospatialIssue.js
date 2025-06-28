const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Event model
const Event = require('../models/Event');

async function fixSpecificGeospatialIssue() {
  try {
    console.log('🔍 Fixing specific geospatial index issue...');
    
    // Find the specific event with empty coordinates
    const eventId = "682497639409f1bba4301a59";
    
    console.log(`📝 Looking for event with ID: ${eventId}`);
    
    // Find the specific event
    const event = await Event.findById(eventId);
    
    if (!event) {
      console.log('❌ Event not found');
      return;
    }
    
    console.log(`📊 Found event: "${event.eventName}"`);
    console.log(`📍 Current location:`, event.location);
    
    // Check if coordinates are empty
    if (!event.location.coordinates || event.location.coordinates.length === 0) {
      console.log('⚠️ Event has empty coordinates - fixing...');
      
      // Fix the coordinates (set to Addis Ababa, Ethiopia as default)
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        {
          $set: {
            "location.coordinates": [38.7636, 9.1450], // Addis Ababa coordinates
            "location.address": "Location not specified"
          }
        },
        { new: true }
      );
      
      console.log('✅ Fixed event coordinates');
      console.log(`📍 New location:`, updatedEvent.location);
      
    } else {
      console.log('✅ Event already has valid coordinates');
    }
    
    // Also find and fix ALL events with empty coordinates
    console.log('\n🔍 Checking for ALL events with empty coordinates...');
    
    const eventsWithEmptyCoords = await Event.find({
      $or: [
        { "location.coordinates": { $size: 0 } },
        { "location.coordinates": null },
        { "location.coordinates": { $exists: false } }
      ]
    });
    
    console.log(`📊 Found ${eventsWithEmptyCoords.length} events with empty coordinates`);
    
    if (eventsWithEmptyCoords.length > 0) {
      console.log('🔧 Fixing all events with empty coordinates...');
      
      for (const event of eventsWithEmptyCoords) {
        console.log(`   - Fixing: "${event.eventName}" (ID: ${event._id})`);
        
        await Event.findByIdAndUpdate(
          event._id,
          {
            $set: {
              "location.coordinates": [38.7636, 9.1450], // Addis Ababa coordinates
              "location.address": "Location not specified"
            }
          }
        );
      }
      
      console.log(`✅ Fixed ${eventsWithEmptyCoords.length} events`);
    }
    
    // Verify the fix by trying to create the geospatial index
    console.log('\n🔍 Verifying geospatial index...');
    
    try {
      // Drop the existing index if it exists
      try {
        await mongoose.connection.db.collection('events').dropIndex('location_2dsphere');
        console.log('🗑️ Dropped existing geospatial index');
      } catch (dropError) {
        // Index doesn't exist, that's fine
      }
      
      // Create the geospatial index
      await mongoose.connection.db.collection('events').createIndex(
        { location: '2dsphere' },
        { name: 'location_2dsphere' }
      );
      
      console.log('✅ Geospatial index created successfully!');
      
    } catch (indexError) {
      console.error('❌ Still have geospatial issues:', indexError.message);
      
      // Find any remaining problematic events
      const problematicEvents = await Event.find({
        $or: [
          { "location.coordinates": { $size: 0 } },
          { "location.coordinates": null },
          { "location.coordinates": { $exists: false } },
          { "location.coordinates": { $type: "array", $not: { $elemMatch: { $type: "number" } } } }
        ]
      });
      
      if (problematicEvents.length > 0) {
        console.log(`⚠️ Still have ${problematicEvents.length} problematic events:`);
        problematicEvents.forEach(event => {
          console.log(`   - "${event.eventName}" (ID: ${event._id}):`, event.location);
        });
      }
    }
    
    console.log('🎉 Geospatial index fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing geospatial issue:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
  }
}

// Run the fix
fixSpecificGeospatialIssue(); 