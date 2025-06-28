const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

const testEventCreation = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test data
    const testEventData = {
      eventName: 'Test Event with Price',
      time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      category: 'Educational/Academic Events',
      pattern: 'Workshop',
      description: 'Test event description',
      updates: 'Test updates',
      organizer: new mongoose.Types.ObjectId(), // Dummy organizer ID
      status: 'pending',
      capacity: 50,
      price: {
        amount: 100,
        currency: 'ETB'
      },
      location: {
        type: 'Point',
        coordinates: [38.7468, 9.0222] // Addis Ababa
      }
    };

    console.log('📝 Testing event creation with data:', testEventData);

    // Try to create the event
    const testEvent = new Event(testEventData);
    await testEvent.save();

    console.log('✅ Test event created successfully!');
    console.log('📊 Event details:', {
      id: testEvent._id,
      name: testEvent.eventName,
      price: testEvent.price,
      capacity: testEvent.capacity
    });

    // Clean up - delete the test event
    await Event.findByIdAndDelete(testEvent._id);
    console.log('🧹 Test event cleaned up');

    console.log('🎉 All tests passed! Event creation is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
testEventCreation(); 