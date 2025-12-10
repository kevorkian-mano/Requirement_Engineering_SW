const mongoose = require('mongoose');

async function getGameIds() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eduquest');
    
    const Game = mongoose.model('Game', new mongoose.Schema({}, { strict: false }));
    
    const patternPlay = await Game.findOne({ title: { $regex: /pattern play/i } });
    const memoryMatch = await Game.findOne({ title: { $regex: /memory match/i } });
    
    console.log('Pattern Play:', patternPlay ? patternPlay._id.toString() : 'NOT FOUND');
    console.log('Memory Match:', memoryMatch ? memoryMatch._id.toString() : 'NOT FOUND');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getGameIds();
