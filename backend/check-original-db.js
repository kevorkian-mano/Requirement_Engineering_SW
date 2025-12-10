const mongoose = require('mongoose');

async function checkDb(dbName) {
  try {
    await mongoose.connect(`mongodb://localhost:27017/${dbName}`);
    
    const Game = mongoose.model('Game', new mongoose.Schema({}, { strict: false }));
    const count = await Game.countDocuments();
    
    console.log(`\n=== ${dbName} ===`);
    console.log(`Total games: ${count}`);
    
    const games = await Game.find().select('title _id').limit(5);
    console.log('Sample games:');
    games.forEach(g => {
      console.log(`  - ${g.title}`);
    });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDb('play-learn-protect');
