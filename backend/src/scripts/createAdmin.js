const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Admin email addresses (add your admin emails here)
const ADMIN_EMAILS = [
  'moderator@eventeasy.com',
  'support@eventeasy.com',
  // Add more admin emails as needed
];

async function createAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    for (const email of ADMIN_EMAILS) {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        // Update existing user to admin
        if (existingUser.role !== 'admin') {
          existingUser.role = 'admin';
          existingUser.adminPermissions = {
            canManageUsers: true,
            canManageEvents: true,
            canManageReports: true,
            canViewAnalytics: true,
            canModerateContent: true,
            canCreateAdmins: false,
            canDeleteAdmins: false
          };
          await existingUser.save();
          console.log(`✅ Updated ${email} to admin`);
        } else {
          console.log(`ℹ️ ${email} is already an admin`);
        }
      } else {
        // Create new admin user
        const hashedPassword = await bcrypt.hash('Admin123!', 12);
        
        const admin = new User({
          name: 'Event Moderator',
          email: email,
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
          adminPermissions: {
            canManageUsers: true,
            canManageEvents: true,
            canManageReports: true,
            canViewAnalytics: true,
            canModerateContent: true,
            canCreateAdmins: false,
            canDeleteAdmins: false
          }
        });

        await admin.save();
        console.log(`✅ Created admin: ${email}`);
        console.log(`   Default password: Admin123!`);
        console.log(`   Please change the password after first login!`);
      }
    }

    console.log('\n🎉 Admin setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Login with any of the admin emails');
    console.log('2. Change the default password immediately');
    console.log('3. Start managing the platform');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the script
createAdmin(); 