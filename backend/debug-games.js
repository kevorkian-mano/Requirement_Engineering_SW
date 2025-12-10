const mongoose = require('mongoose');

async function checkGames() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const gameSchema = new mongoose.Schema({}, { strict: false });
    const Game = mongoose.model('Game', gameSchema, 'games');
    
    // Count total games
    const totalGames = await Game.countDocuments();
    console.log('Total games in database:', totalGames);
    
    // Count easy games
    const easyGames = await Game.find({ difficulty: 'easy' });
    console.log('Easy games count:', easyGames.length);
    console.log('Easy games:', easyGames.map(g => ({ _id: g._id, title: g.title, difficulty: g.difficulty, ageGroups: g.ageGroups })));
    
    // Count by difficulty
    const byDifficulty = await Game.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    console.log('Games by difficulty:', byDifficulty);
    
    // Check first game structure
    const firstGame = await Game.findOne();
    console.log('Sample game structure:', firstGame);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkGames();
