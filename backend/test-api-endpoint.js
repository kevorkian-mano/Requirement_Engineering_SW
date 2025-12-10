const axios = require('axios');
const mongoose = require('mongoose');

async function testAPI() {
  try {
    // First, get a user ID from the database
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', UserSchema, 'users');
    
    const user = await User.findOne();
    if (!user) {
      console.log('No users found');
      process.exit(0);
    }
    
    const userId = user._id.toString();
    console.log('Testing with user:', userId);
    
    await mongoose.connection.close();
    
    // Try to get the user's progress from the API
    // Note: This won't work without a real token, but we can check the data structure
    const ProgressSchema = new mongoose.Schema({}, { strict: false });
    const conn = await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    const Progress = conn.model('Progress', ProgressSchema, 'progresses');
    
    const userProgress = await Progress.find({ userId: new mongoose.Types.ObjectId(userId) }).populate('gameId');
    
    console.log('\n=== User Progress (as returned by service) ===');
    console.log(JSON.stringify(userProgress.map(p => ({
      _id: p._id,
      gameId: p.gameId,
      isCompleted: p.isCompleted,
      score: p.score,
      playCount: p.playCount,
    })), null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testAPI();
