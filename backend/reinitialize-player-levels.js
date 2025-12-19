const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:27017/play-learn-protect';

// Schemas
const gameSchema = new mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', gameSchema, 'games');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

const playerLevelSchema = new mongoose.Schema({}, { strict: false });
const PlayerLevel = mongoose.model('PlayerLevel', playerLevelSchema, 'playerLevels');

async function reinitializeChildrenPlayerLevels() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');

    // Get all child users
    const children = await User.find({ role: 'child' }).lean();
    console.log(`\n👶 Found ${children.length} child users to reinitialize`);

    for (const child of children) {
      console.log(`\n📝 Processing: ${child.name || child.email} (Age: ${child.ageGroup})`);

      // Get easy games for this age group
      const easyGames = await Game.find({
        difficulty: 'easy',
        ageGroups: { $in: [child.ageGroup] },
        isActive: true
      }).lean();

      console.log(`   🎮 Found ${easyGames.length} easy games for age group ${child.ageGroup}`);

      const unlockedGameIds = easyGames.map(g => g._id.toString());

      // Update or create PlayerLevel
      const result = await PlayerLevel.findOneAndUpdate(
        { userId: child._id },
        {
          userId: child._id,
          ageGroup: child.ageGroup,
          currentLevel: 1,
          currentXP: 0,
          totalXPEarned: 0,
          xpNeededForNextLevel: 100,
          totalPoints: 0,
          unlockedGames: unlockedGameIds,
          lockedGames: [],
          hasEarnedTutorialReward: false,
          currentLevelTitle: 'Level 1: The Beginning',
          currentLevelDescription: 'You are just starting your adventure!',
          levelUpHistory: {},
        },
        { upsert: true, new: true }
      );

      console.log(`   ✅ Updated PlayerLevel with ${unlockedGameIds.length} easy games`);
      console.log(`   First 3 games: ${unlockedGameIds.slice(0, 3).join(', ')}`);
    }

    console.log('\n✅ All children reinitialized!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

reinitializeChildrenPlayerLevels();
