const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Replace these with your actual values
const MONGO_URI = 'mongodb+srv://root:passpro@cluster-1.9u8zstf.mongodb.net/';
const SUPER_ADMIN_EMAIL = 'natnaeldarsema@gmail.com'; // Change this to your email
const SUPER_ADMIN_PASSWORD = 'SuperAdmin123!'; // Change this to your password

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Define User schema (simplified version)
    const userSchema = new mongoose.Schema({
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, default: 'attendee' },
      isVerified: { type: Boolean, default: false },
      adminPermissions: {
        canManageUsers: Boolean,
        canManageEvents: Boolean,
        canManageReports: Boolean,
        canViewAnalytics: Boolean,
        canModerateContent: Boolean,
      }
    });

    const User = mongoose.model('User', userSchema);

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ email: SUPER_ADMIN_EMAIL });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists. Updating password...');
      
      // Update password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, saltRounds);
      
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
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, saltRounds);
      
      // Create super admin
      const superAdmin = new User({
        name: 'Super Admin',
        email: SUPER_ADMIN_EMAIL,
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