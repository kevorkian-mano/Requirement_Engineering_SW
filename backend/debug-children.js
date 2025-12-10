const mongoose = require('mongoose');

async function checkChildUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema, 'users');
    
    // Get all child users
    const children = await User.find({ role: 'child' });
    console.log('Total children:', children.length);
    
    children.forEach(child => {
      console.log({
        _id: child._id,
        email: child.email,
        ageGroup: child.ageGroup,
        role: child.role,
      });
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkChildUsers();
