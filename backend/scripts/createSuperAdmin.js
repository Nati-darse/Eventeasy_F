const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import User model
const User = require('../src/models/User');

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/event-easy');
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ email: 'natnaeldarsema@gmail.com' });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists. Updating password...');
      
      // Update password
      const saltRounds = parseInt(process.env.SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash('SuperAdmin123!', saltRounds);
      
      existingSuperAdmin.password = hashedPassword;
      existingSuperAdmin.role = 'super_admin';
      existingSuperAdmin.isVerified = true;
      existingSuperAdmin.adminPermissions = {
        canManageUsers: true,
        canManageEvents: true,
        canManageReports: true,
        canViewAnalytics: true,
        canModerateContent: true,
      };
      
      await existingSuperAdmin.save();
      console.log('Super admin password updated successfully!');
    } else {
      console.log('Creating new super admin...');
      
      // Hash password
      const saltRounds = parseInt(process.env.SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash('SuperAdmin123!', saltRounds);
      
      // Create super admin
      const superAdmin = new User({
        name: 'Super Admin',
        email: 'natnaeldarsema@gmail.com',
        password: hashedPassword,
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
      
      await superAdmin.save();
      console.log('Super admin created successfully!');
    }

    console.log('Super Admin Credentials:');
    console.log('Email: natnaeldarsema@gmail.com');
    console.log('Password: SuperAdmin123!');
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