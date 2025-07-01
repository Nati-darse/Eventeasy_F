const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb+srv://root:passpro@cluster-1.9u8zstf.mongodb.net/test';

const updateSuperAdminPassword = async () => {
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
    console.log('📋 Current details:');
    console.log('  - Name:', superAdmin.name);
    console.log('  - Email:', superAdmin.email);
    console.log('  - Role:', superAdmin.role);
    console.log('  - Is Verified:', superAdmin.isVerified);

    // Hash the correct password
    const correctPassword = 'SuperAdmin123!';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(correctPassword, saltRounds);
    
    console.log('\n🔐 Updating password...');
    console.log('  - New Password:', correctPassword);
    console.log('  - New Hash:', hashedPassword.substring(0, 30) + '...');

    // Update the password
    const result = await users.updateOne(
      { email: 'natnaeldarsema@gmail.com' },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Password updated successfully!');
      
      // Verify the update
      const updatedAdmin = await users.findOne({ email: 'natnaeldarsema@gmail.com' });
      const isMatch = await bcrypt.compare(correctPassword, updatedAdmin.password);
      console.log('🔐 Password verification:', isMatch ? '✅ CORRECT' : '❌ INCORRECT');
      
      if (isMatch) {
        console.log('\n🎉 Super admin is ready for login!');
        console.log('📋 Login credentials:');
        console.log('  - Email: natnaeldarsema@gmail.com');
        console.log('  - Password: SuperAdmin123!');
        console.log('  - Role: super_admin');
      }
    } else {
      console.log('❌ Failed to update password');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

updateSuperAdminPassword(); 