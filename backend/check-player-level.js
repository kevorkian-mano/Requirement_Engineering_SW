const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:27017/play-learn-protect';

const PlayerLevelSchema = new mongoose.Schema({}, { strict: false });
const PlayerLevel = mongoose.model('PlayerLevel', PlayerLevelSchema, 'playerLevels');

async function checkPlayerLevels() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');

    // Get all player levels for children
    const playerLevels = await PlayerLevel.find().lean();
    console.log(`\n📊 Total PlayerLevel records: ${playerLevels.length}`);

    // Group by difficulty
    const byDifficulty = {};
    playerLevels.forEach(pl => {
      if (pl.unlockedGames) {
        const easyCount = pl.unlockedGames.filter(g => g.difficulty === 'easy').length;
        const easyIds = pl.unlockedGames.filter(g => g.difficulty === 'easy').map(g => g.gameId || g._id).slice(0, 3);
        console.log(`\n👤 PlayerLevel ${pl._id}:`);
        console.log(`   Age Group: ${pl.ageGroup || 'N/A'}`);
        console.log(`   Easy Games Count: ${easyCount}`);
        console.log(`   Easy Game IDs (first 3): ${easyIds.join(', ')}`);
        console.log(`   Total Unlocked: ${pl.unlockedGames.length}`);
      }
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPlayerLevels();
