const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:27017/play-learn-protect';

const playerLevelSchema = new mongoose.Schema({}, { strict: false });
const PlayerLevel = mongoose.model('PlayerLevel', playerLevelSchema, 'playerLevels');

const gameSchema = new mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', gameSchema, 'games');

async function debugPlayerLevels() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB\n');

    const playerLevels = await PlayerLevel.find().lean();
    
    for (const pl of playerLevels) {
      console.log(`\n👤 PlayerLevel ID: ${pl._id}`);
      console.log(`   Age Group: ${pl.ageGroup}`);
      console.log(`   Unlocked Games (count): ${pl.unlockedGames ? pl.unlockedGames.length : 0}`);
      
      if (pl.unlockedGames && pl.unlockedGames.length > 0) {
        console.log(`   First game ID (raw): ${pl.unlockedGames[0]}`);
        console.log(`   Type: ${typeof pl.unlockedGames[0]}`);
        
        // Try to find this game
        const game = await Game.findById(pl.unlockedGames[0]).lean();
        if (game) {
          console.log(`   ✅ Found game: ${game.title}`);
        } else {
          console.log(`   ❌ Game not found!`);
          
          // List first 3 game IDs from database
          const allGames = await Game.find().limit(3).lean();
          console.log(`   Available game IDs in DB:`);
          allGames.forEach(g => {
            console.log(`     - ${g._id} (${g.title})`);
          });
        }
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugPlayerLevels();
