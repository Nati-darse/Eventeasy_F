const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

/**
 * Script to create an admin user
 * Run with: node src/scripts/createAdminUser.js
 */

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Admin user data
    const adminData = {
      name: 'Admin User',
      email: 'admin@eventeasy.com',
      password: 'admin123456',
      role: 'super_admin', // This gives full admin access
      isVerified: true,
      adminPermissions: {
        canManageUsers: true,
        canManageEvents: true,
        canManageReports: true,
        canViewAnalytics: true,
        canModerateContent: true,
      }
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists with email:', adminData.email);
      console.log('Admin ID:', existingAdmin._id);
      console.log('Admin Role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Role:', admin.role);
    console.log('🆔 User ID:', admin._id);

    console.log('\n🎉 You can now login with:');
    console.log('Email: admin@eventeasy.com');
    console.log('Password: admin123456');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
createAdminUser(); 