const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Use the same connection string as the backend
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://root:passpro@cluster-1.9u8zstf.mongodb.net/Event-Easy';

const debugSuperAdmin = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Define a simple schema to match the User model
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isVerified: Boolean,
      googleId: String
    });

    const User = mongoose.model('User', userSchema, 'Users');

    console.log('🔍 Looking for super admin...');
    const user = await User.findOne({ email: 'natnaeldarsema@gmail.com' });
    
    if (!user) {
      console.log('❌ Super admin not found in database!');
      return;
    }

    console.log('✅ Super admin found!');
    console.log('📋 User details:');
    console.log('  - Name:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - Is Verified:', user.isVerified);
    console.log('  - Has Password:', !!user.password);
    console.log('  - Password Hash:', user.password ? user.password.substring(0, 30) + '...' : 'MISSING');
    console.log('  - Google ID:', user.googleId || 'None');

    if (user.password) {
      console.log('\n🔐 Testing password comparison...');
      const testPassword = 'SuperAdmin123!';
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log('  - Test Password:', testPassword);
      console.log('  - Password Match:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');
      
      if (!isMatch) {
        console.log('\n🔧 Trying to hash the password manually...');
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(testPassword, saltRounds);
        console.log('  - Manual Hash:', hashedPassword.substring(0, 30) + '...');
        console.log('  - Stored Hash:', user.password.substring(0, 30) + '...');
        console.log('  - Hashes Match:', hashedPassword === user.password ? '✅ YES' : '❌ NO');
      }
    }

    // Check if user meets all login requirements
    console.log('\n📋 Login Requirements Check:');
    console.log('  - User exists:', '✅ YES');
    console.log('  - User is verified:', user.isVerified ? '✅ YES' : '❌ NO');
    console.log('  - User has password:', !!user.password ? '✅ YES' : '❌ NO');
    console.log('  - User is not Google OAuth:', !user.googleId ? '✅ YES' : '❌ NO');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

debugSuperAdmin(); 