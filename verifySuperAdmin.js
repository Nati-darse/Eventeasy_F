const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb+srv://root:passpro@cluster-1.9u8zstf.mongodb.net/event-easy';

const verifySuperAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'natnaeldarsema@gmail.com' }).select('+password');
    
    if (!user) {
      console.log('❌ Super admin not found!');
      return;
    }

    console.log('✅ Super admin found!');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Is Verified:', user.isVerified);
    console.log('Has Password:', !!user.password);
    console.log('Password Hash:', user.password ? user.password.substring(0, 20) + '...' : 'MISSING');
    console.log('Google ID:', user.googleId || 'None');
    console.log('Created At:', user.createdAt);
    console.log('Updated At:', user.updatedAt);

    // Test password comparison
    const testPassword = 'SuperAdmin123!';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Password Test:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

verifySuperAdmin(); 