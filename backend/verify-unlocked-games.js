const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:27017/play-learn-protect';

const gameSchema = new mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', gameSchema, 'games');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

const playerLevelSchema = new mongoose.Schema({}, { strict: false });
const PlayerLevel = mongoose.model('PlayerLevel', playerLevelSchema, 'playerLevels');

async function verifyUnlockedGames() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB\n');

    // Get all active easy games by age group
    console.log('📊 VERIFYING EASY GAMES IN DATABASE:\n');
    
    const ageGroups = ['3-5', '6-8', '9-12'];
    const easyGamesByAge = {};

    for (const ageGroup of ageGroups) {
      const games = await Game.find({
        isActive: true,
        difficulty: 'easy',
        ageGroups: { $in: [ageGroup] }
      }).lean();
      
      easyGamesByAge[ageGroup] = games;
      console.log(`👶 Age ${ageGroup}: ${games.length} easy games`);
      games.forEach((g, i) => console.log(`   ${i + 1}. ${g.title}`));
      console.log();
    }

    // Check player levels
    console.log('📋 CHECKING PLAYER LEVELS:\n');
    const playerLevels = await PlayerLevel.find().lean();
    
    if (playerLevels.length === 0) {
      console.log('⚠️  No PlayerLevel records found!\n');
      console.log('Initialize them with: node init-children-player-levels.js\n');
    } else {
      console.log(`Found ${playerLevels.length} PlayerLevel records:\n`);
      
      for (const pl of playerLevels) {
        const user = await User.findById(pl.userId).lean();
        console.log(`👤 User: ${user?.name || user?.email || 'N/A'}`);
        console.log(`   Age Group: ${pl.ageGroup}`);
        console.log(`   Unlocked Games Count: ${pl.unlockedGames ? pl.unlockedGames.length : 0}`);
        
        if (pl.unlockedGames && pl.unlockedGames.length > 0) {
          const unlockedGameDetails = [];
          for (const gameId of pl.unlockedGames.slice(0, 5)) {
            const game = await Game.findById(gameId).lean();
            if (game) {
              unlockedGameDetails.push(`${game.title} (${game.difficulty})`);
            }
          }
          console.log(`   First 5 Unlocked: ${unlockedGameDetails.join(', ')}`);
          if (pl.unlockedGames.length > 5) {
            console.log(`   ... and ${pl.unlockedGames.length - 5} more`);
          }
        } else {
          console.log(`   ⚠️  No unlocked games!`);
        }
        console.log();
      }

      // Verify that all unlocked games are easy
      console.log('🔍 VALIDATION:\n');
      for (const pl of playerLevels) {
        const ageGroup = pl.ageGroup;
        const expectedEasyGames = easyGamesByAge[ageGroup];
        const expectedIds = new Set(expectedEasyGames.map(g => g._id.toString()));
        const user = await User.findById(pl.userId).lean();
        
        const hasCorrectUnlocks = pl.unlockedGames && 
          pl.unlockedGames.length === expectedEasyGames.length &&
          pl.unlockedGames.every(id => expectedIds.has(id));

        const status = hasCorrectUnlocks ? '✅' : '❌';
        const email = user?.email || 'N/A';
        console.log(`${status} ${email} (Age ${ageGroup}): ${pl.unlockedGames ? pl.unlockedGames.length : 0}/${expectedEasyGames.length} easy games`);
        
        if (!hasCorrectUnlocks) {
          console.log(`   Expected: ${expectedEasyGames.map(g => g.title).join(', ')}`);
          const unlocked = pl.unlockedGames ? pl.unlockedGames.map(id => {
            const game = expectedEasyGames.find(g => g._id.toString() === id);
            return game ? game.title : 'Unknown';
          }) : [];
          console.log(`   Got: ${unlocked.join(', ')}`);
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

verifyUnlockedGames();
