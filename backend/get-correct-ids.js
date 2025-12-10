const mongoose = require('mongoose');

async function getIds() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const Game = mongoose.model('Game', new mongoose.Schema({}, { strict: false }));
    
    const patternPlay = await Game.findOne({ title: 'Pattern Play' });
    const memoryMatch = await Game.findOne({ title: 'Memory Match' });
    
    console.log('Pattern Play ID:', patternPlay ? patternPlay._id.toString() : 'NOT FOUND');
    console.log('Memory Match ID:', memoryMatch ? memoryMatch._id.toString() : 'NOT FOUND');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

getIds();
