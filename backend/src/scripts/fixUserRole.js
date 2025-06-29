const mongoose = require('mongoose');
const User = require('../models/User');

// Use a working MongoDB URI - you'll need to replace this with your actual working MongoDB URI
const MONGO_URI = 'mongodb://localhost:27017/eventeasy'; // Change this to your working MongoDB URI

async function fixUserRole() {
  try {
    // Connect to database
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database');

    // Find and update the user
    const user = await User.findOne({ email: 'natnaeldarsema@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ Found user: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Current role: ${user.role}`);

    // Update to super admin
    user.role = 'super_admin';
    user.isVerified = true;
    user.adminPermissions = {
      canManageUsers: true,
      canManageEvents: true,
      canManageReports: true,
      canViewAnalytics: true,
      canModerateContent: true,
      canCreateAdmins: true,
      canDeleteAdmins: true
    };

    await user.save();

    console.log(`✅ User updated to super admin successfully!`);
    console.log(`👤 New role: ${user.role}`);
    console.log(`✅ Verified: ${user.isVerified}`);

  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

fixUserRole(); 