const mongoose = require('mongoose');

async function checkGames() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eduquest');
    
    const Game = mongoose.model('Game', new mongoose.Schema({}, { strict: false }));
    
    // Find Pattern Play and Memory Match
    const patternPlay = await Game.findOne({ title: { $regex: /pattern/i } });
    const memoryMatch = await Game.findOne({ title: { $regex: /memory/i } });
    
    console.log('\n=== Games Found ===');
    if (patternPlay) {
      console.log('Pattern Play:', patternPlay._id.toString());
    } else {
      console.log('Pattern Play: NOT FOUND');
    }
    
    if (memoryMatch) {
      console.log('Memory Match:', memoryMatch._id.toString());
    } else {
      console.log('Memory Match: NOT FOUND');
    }
    
    // List all games
    const allGames = await Game.find().select('title _id').sort({ createdAt: -1 }).limit(10);
    console.log('\n=== Recent Games ===');
    allGames.forEach(g => {
      console.log(`${g.title}: ${g._id}`);
    });
    
    const totalCount = await Game.countDocuments();
    console.log(`\nTotal games in database: ${totalCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkGames();
