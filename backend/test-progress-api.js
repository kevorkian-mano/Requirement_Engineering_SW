const mongoose = require('mongoose');

async function testProgress() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const progressSchema = new mongoose.Schema({}, { strict: false });
    const Progress = mongoose.model('Progress', progressSchema, 'progresses');
    
    // Get all progress records
    const allProgress = await Progress.find().limit(5);
    
    console.log('\n=== All Progress Records ===');
    allProgress.forEach(p => {
      console.log(JSON.stringify({
        _id: p._id.toString(),
        gameId: p.gameId?.toString ? p.gameId.toString() : p.gameId,
        userId: p.userId?.toString ? p.userId.toString() : p.userId,
        isCompleted: p.isCompleted,
        score: p.score,
        playCount: p.playCount,
      }, null, 2));
    });
    
    // Get completed games
    const completedProgress = await Progress.find({ isCompleted: true });
    console.log(`\n=== Completed Games: ${completedProgress.length} ===`);
    completedProgress.forEach(p => {
      console.log(`Game ${p.gameId}: isCompleted = ${p.isCompleted}`);
    });
    
    // Get in-progress games
    const incompleteProgress = await Progress.find({ isCompleted: false });
    console.log(`\n=== Incomplete Games: ${incompleteProgress.length} ===`);
    incompleteProgress.forEach(p => {
      console.log(`Game ${p.gameId}: isCompleted = ${p.isCompleted}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testProgress();
