const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:27017/play-learn-protect';

const gameSchema = new mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', gameSchema, 'games');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

const playerLevelSchema = new mongoose.Schema({}, { strict: false });
const PlayerLevel = mongoose.model('PlayerLevel', playerLevelSchema, 'playerLevels');

async function comprehensiveDiagnosis() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB\n');

    console.log('=' .repeat(80));
    console.log('🔍 COMPREHENSIVE DIAGNOSIS: EASY GAMES UNLOCK STATUS');
    console.log('=' .repeat(80));

    // 1. Check database games
    console.log('\n📊 STEP 1: Database Games Check');
    console.log('-' .repeat(80));
    
    const totalGames = await Game.countDocuments();
    const activeGames = await Game.countDocuments({ isActive: true });
    const easyGames = await Game.countDocuments({ difficulty: 'easy', isActive: true });
    
    console.log(`Total games in DB: ${totalGames}`);
    console.log(`Active games: ${activeGames}`);
    console.log(`Active easy games: ${easyGames}`);

    // 2. Check each age group's easy games
    console.log('\n📚 STEP 2: Easy Games by Age Group');
    console.log('-' .repeat(80));
    
    const ageGroups = ['3-5', '6-8', '9-12'];
    const easyGamesByAge = {};

    for (const ageGroup of ageGroups) {
      const games = await Game.find({
        isActive: true,
        difficulty: 'easy',
        ageGroups: { $in: [ageGroup] }
      }).select('_id title difficulty ageGroups').lean();
      
      easyGamesByAge[ageGroup] = games;
      console.log(`\n👶 Age ${ageGroup}: ${games.length} easy games`);
      games.forEach((g, i) => {
        console.log(`   ${i + 1}. ${g.title} (ID: ${g._id})`);
      });
    }

    // 3. Check player levels
    console.log('\n\n👤 STEP 3: Player Levels');
    console.log('-' .repeat(80));
    
    const playerLevels = await PlayerLevel.find().lean();
    console.log(`Total PlayerLevel records: ${playerLevels.length}\n`);

    if (playerLevels.length === 0) {
      console.log('❌ NO PLAYER LEVELS FOUND!');
      console.log('Run: node reinitialize-player-levels.js');
      await mongoose.disconnect();
      return;
    }

    // 4. Detailed player analysis
    console.log('\n🎮 STEP 4: Detailed Player Analysis');
    console.log('-' .repeat(80));
    
    for (const pl of playerLevels) {
      const user = await User.findById(pl.userId).lean();
      console.log(`\n📋 User: ${user?.email || 'N/A'}`);
      console.log(`   ID: ${pl._id}`);
      console.log(`   Age Group: ${pl.ageGroup}`);
      console.log(`   Current Level: ${pl.currentLevel}`);
      console.log(`   Unlocked Games (count): ${pl.unlockedGames ? pl.unlockedGames.length : 0}`);
      
      const expectedEasyGames = easyGamesByAge[pl.ageGroup] || [];
      console.log(`   Expected Easy Games: ${expectedEasyGames.length}`);
      
      // Verify IDs match
      if (pl.unlockedGames && pl.unlockedGames.length > 0) {
        console.log(`\n   🔎 Verifying unlocked game IDs:`);
        const validIds = [];
        const invalidIds = [];
        
        for (const gameId of pl.unlockedGames) {
          const game = await Game.findById(gameId).lean();
          if (game) {
            validIds.push(gameId);
            console.log(`      ✅ ${gameId.substring(0, 8)}... → ${game.title} (${game.difficulty})`);
          } else {
            invalidIds.push(gameId);
            console.log(`      ❌ ${gameId.substring(0, 8)}... → NOT FOUND`);
          }
        }
        
        if (invalidIds.length > 0) {
          console.log(`\n   ⚠️  PROBLEM: ${invalidIds.length} game IDs not found in database!`);
        }
        
        // Check if they're all EASY
        const allEasy = validIds.length === pl.unlockedGames.length;
        if (allEasy) {
          console.log(`\n   ✅ All unlocked games are valid and accessible`);
        }
      } else {
        console.log(`\n   ❌ NO UNLOCKED GAMES!`);
      }
    }

    // 5. Summary and recommendations
    console.log('\n\n📋 STEP 5: Validation Summary');
    console.log('-' .repeat(80));
    
    let allValid = true;
    for (const pl of playerLevels) {
      const user = await User.findById(pl.userId).lean();
      const email = user?.email || 'Unknown';
      const expectedCount = easyGamesByAge[pl.ageGroup]?.length || 0;
      const actualCount = pl.unlockedGames ? pl.unlockedGames.length : 0;
      
      if (actualCount === expectedCount && actualCount > 0) {
        // Check if all IDs are valid
        let allValid_individual = true;
        for (const gameId of pl.unlockedGames) {
          const game = await Game.findById(gameId).lean();
          if (!game) {
            allValid_individual = false;
            break;
          }
        }
        
        if (allValid_individual) {
          console.log(`✅ ${email} (Age ${pl.ageGroup}): ${actualCount} easy games unlocked and valid`);
        } else {
          console.log(`❌ ${email} (Age ${pl.ageGroup}): Game IDs mismatch with database`);
          allValid = false;
        }
      } else {
        console.log(`❌ ${email} (Age ${pl.ageGroup}): Expected ${expectedCount}, got ${actualCount}`);
        allValid = false;
      }
    }

    console.log('\n' + '=' .repeat(80));
    if (allValid) {
      console.log('✅ DIAGNOSIS: ALL EASY GAMES ARE PROPERLY UNLOCKED!');
    } else {
      console.log('❌ DIAGNOSIS: ISSUES FOUND - RUN: node reinitialize-player-levels.js');
    }
    console.log('=' .repeat(80));

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

comprehensiveDiagnosis();
