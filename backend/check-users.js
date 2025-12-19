const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:27017/play-learn-protect';

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema, 'users');

async function checkUsers() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');

    const allUsers = await User.find().lean();
    console.log(`\n📊 Total Users: ${allUsers.length}`);

    const childUsers = allUsers.filter(u => u.role === 'child');
    console.log(`👶 Child Users: ${childUsers.length}`);
    console.log(`👨‍🏫 Teacher/Parent Users: ${allUsers.length - childUsers.length}`);

    if (childUsers.length > 0) {
      console.log('\n🎮 Child User Details:');
      childUsers.forEach(child => {
        console.log(`  - ${child.name || 'N/A'} (ID: ${child._id})`);
        console.log(`    Age Group: ${child.ageGroup}`);
        console.log(`    Email: ${child.email}`);
        console.log(`    Created: ${child.createdAt}`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
