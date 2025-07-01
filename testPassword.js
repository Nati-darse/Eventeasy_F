const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb+srv://root:passpro@cluster-1.9u8zstf.mongodb.net/test';

const testPassword = async () => {
  try {
    console.log('🔍 Connecting to test database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to test database');

    // Get the Users collection
    const users = mongoose.connection.db.collection('Users');
    
    // Find the super admin
    const superAdmin = await users.findOne({ email: 'natnaeldarsema@gmail.com' });
    
    if (!superAdmin) {
      console.log('❌ Super admin not found!');
      return;
    }

    console.log('✅ Super admin found!');
    console.log('📋 User details:');
    console.log('  - Name:', superAdmin.name);
    console.log('  - Email:', superAdmin.email);
    console.log('  - Role:', superAdmin.role);
    console.log('  - Is Verified:', superAdmin.isVerified);
    console.log('  - Has Password:', !!superAdmin.password);
    console.log('  - Password Hash:', superAdmin.password ? superAdmin.password.substring(0, 30) + '...' : 'MISSING');

    if (superAdmin.password) {
      console.log('\n🔐 Testing password comparison...');
      const testPassword = 'SuperAdmin123!';
      const isMatch = await bcrypt.compare(testPassword, superAdmin.password);
      console.log('  - Test Password:', testPassword);
      console.log('  - Password Match:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');
      
      if (!isMatch) {
        console.log('\n🔧 Trying to hash the password manually...');
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
        console.log('  - Manual Hash:', hashedPassword.substring(0, 30) + '...');
        console.log('  - Stored Hash:', superAdmin.password.substring(0, 30) + '...');
        console.log('  - Hashes Match:', hashedPassword === superAdmin.password ? '✅ YES' : '❌ NO');
        
        // Try different salt rounds
        console.log('\n🔧 Testing different salt rounds...');
        for (let rounds = 10; rounds <= 12; rounds++) {
          const testHash = await bcrypt.hash(testPassword, rounds);
          const testMatch = await bcrypt.compare(testPassword, testHash);
          console.log(`  - Salt rounds ${rounds}: ${testMatch ? '✅ Works' : '❌ Fails'}`);
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

testPassword(); 