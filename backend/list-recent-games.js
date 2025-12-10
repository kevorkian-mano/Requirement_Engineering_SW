const mongoose = require('mongoose');

async function listGames() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eduquest');
    
    const Game = mongoose.model('Game', new mongoose.Schema({}, { strict: false }));
    
    const games = await Game.find().select('title titleAr').sort({ _id: -1 }).limit(5);
    
    console.log('Recent 5 games:');
    games.forEach(game => {
      console.log(`- ${game.title} (${game.titleAr}) - ID: ${game._id}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listGames();
