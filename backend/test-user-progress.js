const mongoose = require('mongoose');

async function testUserProgress() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const UserSchema = new mongoose.Schema({}, { strict: false });
    const ProgressSchema = new mongoose.Schema({}, { strict: false });
    
    const User = mongoose.model('User', UserSchema, 'users');
    const Progress = mongoose.model('Progress', ProgressSchema, 'progresses');
    
    // Find a child user (role = 'child')
    const user = await User.findOne({ role: 'child' });
    if (!user) {
      console.log('No child users found');
      process.exit(0);
    }
    
    const userId = user._id.toString();
    console.log('User found:', {
      _id: userId,
      firstName: user.firstName,
      role: user.role,
    });
    
    // Get user's progress
    const userProgress = await Progress.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('gameId')
      .sort({ createdAt: -1 });
    
    console.log(`\n=== Progress for user (${userProgress.length} records) ===`);
    userProgress.forEach((p, i) => {
      console.log(`${i+1}. Game: ${p.gameId?.title || p.gameId}`);
      console.log(`   isCompleted: ${p.isCompleted}`);
      console.log(`   score: ${p.score}`);
      console.log(`   playCount: ${p.playCount}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testUserProgress();
