const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function checkUser(email) {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found in database`);
      console.log('\n📝 Available users:');
      const allUsers = await User.find({}, 'name email role isVerified');
      allUsers.forEach(u => {
        console.log(`- ${u.name} (${u.email}) - Role: ${u.role} - Verified: ${u.isVerified}`);
      });
      return;
    }

    console.log(`✅ User found: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Role: ${user.role}`);
    console.log(`✅ Verified: ${user.isVerified}`);
    console.log(`🔒 Suspended: ${user.isSuspended}`);
    
    if (user.adminPermissions) {
      console.log(`🔑 Admin Permissions:`, user.adminPermissions);
    }

    // Check if user can access admin
    if (['admin', 'super_admin'].includes(user.role)) {
      console.log(`✅ User has admin privileges`);
    } else {
      console.log(`❌ User does not have admin privileges`);
      console.log(`   Current role: ${user.role}`);
      console.log(`   Required role: admin or super_admin`);
    }

  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

// Get email from command line argument
const email = process.argv[2] || 'natnaeldarsema@gmail.com';

if (!email) {
  console.log('❌ Please provide an email address:');
  console.log('Usage: node src/scripts/checkUser.js your-email@example.com');
  process.exit(1);
}

checkUser(email); 