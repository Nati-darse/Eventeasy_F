const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./backend/src/models/User');

// Replace these with your actual values
const MONGO_URI = 'mongodb+srv://root:passpro@cluster-1.9u8zstf.mongodb.net/event-easy';
const SUPER_ADMIN_EMAIL = 'natnaeldarsema@gmail.com'; // Change this to your email
const SUPER_ADMIN_PASSWORD = 'SuperAdmin123!'; // Change this to your password

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Always select password explicitly due to select: false
    let user = await User.findOne({ email: SUPER_ADMIN_EMAIL }).select('+password');

    if (user) {
      console.log('Super admin already exists. Updating password...');
      user.password = SUPER_ADMIN_PASSWORD; // Will be hashed by pre-save hook
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
      console.log('Super admin password updated successfully!');
    } else {
      console.log('Creating new super admin...');
      user = new User({
        name: 'Super Admin',
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD, // Will be hashed by pre-save hook
        role: 'super_admin',
        isVerified: true,
        adminPermissions: {
          canManageUsers: true,
          canManageEvents: true,
          canManageReports: true,
          canViewAnalytics: true,
          canModerateContent: true,
        },
      });
      await user.save();
      console.log('Super admin created successfully!');
    }

    // Print the password hash for debug
    const savedUser = await User.findOne({ email: SUPER_ADMIN_EMAIL }).select('+password');
    console.log('Super admin password hash in DB:', savedUser.password);

    console.log('Super Admin Credentials:');
    console.log('Email:', SUPER_ADMIN_EMAIL);
    console.log('Password:', SUPER_ADMIN_PASSWORD);
    console.log('Role: super_admin');
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createSuperAdmin(); 