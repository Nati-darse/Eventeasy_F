const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User model
const User = require('../models/User');

async function checkUserPasswords() {
  try {
    console.log('🔍 Checking user passwords...');
    
    // Find all users
    const users = await User.find({}).select('+password');
    
    console.log(`📊 Found ${users.length} total users`);
    
    let usersWithPassword = 0;
    let usersWithoutPassword = 0;
    let googleUsers = 0;
    
    for (const user of users) {
      if (user.password) {
        usersWithPassword++;
        console.log(`✅ User "${user.name}" (${user.email}) has password`);
      } else {
        usersWithoutPassword++;
        if (user.googleId) {
          googleUsers++;
          console.log(`🔗 User "${user.name}" (${user.email}) is Google OAuth user (no password needed)`);
        } else {
          console.log(`⚠️ User "${user.name}" (${user.email}) has NO password and NO Google ID`);
        }
      }
    }
    
    console.log('\n📈 Summary:');
    console.log(`   - Total users: ${users.length}`);
    console.log(`   - Users with password: ${usersWithPassword}`);
    console.log(`   - Google OAuth users: ${googleUsers}`);
    console.log(`   - Users without password (potential issue): ${usersWithoutPassword - googleUsers}`);
    
    if (usersWithoutPassword - googleUsers > 0) {
      console.log('\n⚠️ Found users without passwords who are not Google OAuth users!');
      console.log('   These users cannot login with email/password.');
    } else {
      console.log('\n✅ All non-Google users have passwords!');
    }
    
  } catch (error) {
    console.error('❌ Error checking user passwords:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
  }
}

// Run the check
checkUserPasswords(); 