const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:27017/play-learn-protect';

const gameSchema = new mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', gameSchema, 'games');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

const playerLevelSchema = new mongoose.Schema({}, { strict: false });
const PlayerLevel = mongoose.model('PlayerLevel', playerLevelSchema, 'playerLevels');

async function quickDiagnosis() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB\n');

    // Get all easy games
    const allEasyGames = await Game.find({ difficulty: 'easy', isActive: true }).lean();
    const gameMap = {};
    allEasyGames.forEach(g => {
      gameMap[g._id.toString()] = g;
    });

    console.log('📊 DATABASE EASY GAMES:');
    console.log(`Total easy games: ${allEasyGames.length}\n`);

    // Get all players
    const players = await PlayerLevel.find().lean();
    console.log(`👤 PLAYERS: ${players.length}\n`);

    if (players.length === 0) {
      console.log('❌ No players found!');
      await mongoose.disconnect();
      return;
    }

    // Check each player
    for (const pl of players) {
      const user = await User.findById(pl.userId).lean();
      console.log(`\n👤 ${user?.email || 'Unknown'} (Age ${pl.ageGroup}):`);
      console.log(`   Unlocked games: ${pl.unlockedGames?.length || 0}`);
      
      if (!pl.unlockedGames || pl.unlockedGames.length === 0) {
        console.log(`   ❌ NO GAMES UNLOCKED!`);
        continue;
      }

      // Check if each game exists
      let validCount = 0;
      for (const gid of pl.unlockedGames) {
        if (gameMap[gid]) {
          validCount++;
        } else {
          console.log(`   ❌ Invalid ID: ${gid}`);
        }
      }

      if (validCount === pl.unlockedGames.length) {
        console.log(`   ✅ All ${validCount} games are valid`);
        // List them
        pl.unlockedGames.slice(0, 3).forEach((gid, i) => {
          console.log(`      ${i + 1}. ${gameMap[gid].title}`);
        });
        if (pl.unlockedGames.length > 3) {
          console.log(`      ... and ${pl.unlockedGames.length - 3} more`);
        }
      } else {
        console.log(`   ❌ Only ${validCount}/${pl.unlockedGames.length} games are valid`);
      }
    }

    console.log('\n✅ Done');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

quickDiagnosis();
