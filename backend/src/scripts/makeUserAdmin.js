const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

/**
 * Script to make an existing user an admin
 * Run with: node src/scripts/makeUserAdmin.js
 */

const makeUserAdmin = async (userEmail) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('❌ User not found with email:', userEmail);
      console.log('Available users:');
      const allUsers = await User.find({}, 'name email role');
      allUsers.forEach(u => {
        console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`);
      });
      return;
    }

    // Update user to admin
    user.role = 'super_admin';
    user.isVerified = true;
    user.adminPermissions = {
      canManageUsers: true,
      canManageEvents: true,
      canManageReports: true,
      canViewAnalytics: true,
      canModerateContent: true,
    };

    await user.save();

    console.log('✅ User updated to admin successfully!');
    console.log('👤 Name:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🔑 New Role:', user.role);
    console.log('🆔 User ID:', user._id);

    console.log('\n🎉 You can now login with your existing credentials and access admin features!');

  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Get email from command line argument or use default
const userEmail = process.argv[2] || 'your-email@example.com';

if (userEmail === 'your-email@example.com') {
  console.log('❌ Please provide an email address:');
  console.log('Usage: node src/scripts/makeUserAdmin.js your-email@example.com');
  process.exit(1);
}

makeUserAdmin(userEmail); 