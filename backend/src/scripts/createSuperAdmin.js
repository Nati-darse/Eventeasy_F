const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Super admin email addresses (add your super admin emails here)
const SUPER_ADMIN_EMAILS = [
  'superadmin@eventeasy.com',
  'admin@eventeasy.com',
  'natnaeldarsema@gmail.com',
  // Add more super admin emails as needed
];

async function createSuperAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    for (const email of SUPER_ADMIN_EMAILS) {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        // Update existing user to super admin
        if (existingUser.role !== 'super_admin') {
          existingUser.role = 'super_admin';
          existingUser.isVerified = true;
          existingUser.adminPermissions = {
            canManageUsers: true,
            canManageEvents: true,
            canManageReports: true,
            canViewAnalytics: true,
            canModerateContent: true,
            canCreateAdmins: true,
            canDeleteAdmins: true
          };
          await existingUser.save();
          console.log(`✅ Updated ${email} to super admin`);
        } else {
          console.log(`ℹ️ ${email} is already a super admin`);
        }
      } else {
        // Create new super admin user
        const hashedPassword = await bcrypt.hash('SuperAdmin123!', 12);
        
        const superAdmin = new User({
          name: 'Super Administrator',
          email: email,
          password: hashedPassword,
          role: 'super_admin',
          isVerified: true,
          adminPermissions: {
            canManageUsers: true,
            canManageEvents: true,
            canManageReports: true,
            canViewAnalytics: true,
            canModerateContent: true,
            canCreateAdmins: true,
            canDeleteAdmins: true
          }
        });

        await superAdmin.save();
        console.log(`✅ Created super admin: ${email}`);
        console.log(`   Default password: SuperAdmin123!`);
        console.log(`   Please change the password after first login!`);
      }
    }

    console.log('\n🎉 Super admin setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Login with any of the super admin emails');
    console.log('2. Change the default password immediately');
    console.log('3. Create additional admin users as needed');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the script
createSuperAdmin(); 