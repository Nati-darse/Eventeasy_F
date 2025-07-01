const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://root:passpro@cluster-1.9u8zstf.mongodb.net/test';

const checkTestDB = async () => {
  try {
    console.log('🔍 Connecting to test database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to test database');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Collections in test database:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });

    // Check Users collection specifically
    const usersCollection = collections.find(c => c.name === 'Users' || c.name === 'users');
    if (usersCollection) {
      console.log(`\n🔍 Checking ${usersCollection.name} collection...`);
      
      const users = mongoose.connection.db.collection(usersCollection.name);
      const userCount = await users.countDocuments();
      console.log(`  Total users: ${userCount}`);
      
      if (userCount > 0) {
        console.log('\n📋 Sample users:');
        const sampleUsers = await users.find({}).limit(5).toArray();
        sampleUsers.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.name || 'No name'} (${user.email}) - Role: ${user.role || 'No role'}`);
        });
        
        // Look for super admin specifically
        const superAdmin = await users.findOne({ email: 'natnaeldarsema@gmail.com' });
        if (superAdmin) {
          console.log('\n🎯 Found super admin!');
          console.log('  Name:', superAdmin.name);
          console.log('  Email:', superAdmin.email);
          console.log('  Role:', superAdmin.role);
          console.log('  Is Verified:', superAdmin.isVerified);
          console.log('  Has Password:', !!superAdmin.password);
          console.log('  Google ID:', superAdmin.googleId || 'None');
        } else {
          console.log('\n❌ Super admin not found in Users collection');
        }
      } else {
        console.log('\n❌ No users found in Users collection');
      }
    } else {
      console.log('\n❌ No Users collection found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

checkTestDB(); 