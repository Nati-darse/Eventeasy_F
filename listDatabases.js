const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://root:passpro@cluster-1.9u8zstf.mongodb.net/';

const listDatabases = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the admin database
    const adminDb = mongoose.connection.db.admin();
    
    // List all databases
    const dbList = await adminDb.listDatabases();
    console.log('\n📋 Available databases:');
    dbList.databases.forEach(db => {
      console.log(`  - ${db.name} (${db.sizeOnDisk} bytes)`);
    });

    // Try to find users in different databases
    for (const dbInfo of dbList.databases) {
      if (dbInfo.name !== 'admin' && dbInfo.name !== 'local') {
        console.log(`\n🔍 Checking database: ${dbInfo.name}`);
        
        try {
          const db = mongoose.connection.useDb(dbInfo.name);
          const collections = await db.listCollections().toArray();
          console.log(`  Collections in ${dbInfo.name}:`, collections.map(c => c.name));
          
          // Check if there's a Users collection
          const usersCollection = collections.find(c => c.name === 'Users' || c.name === 'users');
          if (usersCollection) {
            console.log(`  ✅ Found Users collection in ${dbInfo.name}`);
            
            // Try to find the super admin
            const users = db.collection(usersCollection.name);
            const superAdmin = await users.findOne({ email: 'natnaeldarsema@gmail.com' });
            if (superAdmin) {
              console.log(`  🎯 Found super admin in ${dbInfo.name}!`);
              console.log(`    Name: ${superAdmin.name}`);
              console.log(`    Role: ${superAdmin.role}`);
              console.log(`    Is Verified: ${superAdmin.isVerified}`);
              console.log(`    Has Password: ${!!superAdmin.password}`);
            } else {
              console.log(`  ❌ Super admin not found in ${dbInfo.name}`);
            }
          }
        } catch (error) {
          console.log(`  ❌ Error accessing ${dbInfo.name}:`, error.message);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

listDatabases(); 