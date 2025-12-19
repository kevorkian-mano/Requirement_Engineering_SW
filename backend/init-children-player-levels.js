const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:27017/play-learn-protect';

// Schemas
const gameSchema = new mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', gameSchema, 'games');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

const playerLevelSchema = new mongoose.Schema({}, { strict: false });
const PlayerLevel = mongoose.model('PlayerLevel', playerLevelSchema, 'playerLevels');

async function initializeChildrenPlayerLevels() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');

    // Get all child users
    const children = await User.find({ role: 'child' }).lean();
    console.log(`\n👶 Found ${children.length} child users to initialize`);

    for (const child of children) {
      console.log(`\n📝 Processing child: ${child.name || child.email} (Age: ${child.ageGroup})`);

      // Check if PlayerLevel already exists
      const existingLevel = await PlayerLevel.findOne({ userId: child._id });
      if (existingLevel) {
        console.log(`   ⚠️  PlayerLevel already exists, skipping`);
        continue;
      }

      // Get easy games for this age group
      const easyGames = await Game.find({
        difficulty: 'easy',
        ageGroups: { $in: [child.ageGroup] },
        isActive: true
      }).lean();

      console.log(`   🎮 Found ${easyGames.length} easy games for age group ${child.ageGroup}`);

      const unlockedGameIds = easyGames.map(g => g._id.toString());

      // Create PlayerLevel
      const playerLevel = new PlayerLevel({
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
      });

      await playerLevel.save();
      console.log(`   ✅ Created PlayerLevel with ${unlockedGameIds.length} unlocked games`);
      console.log(`   First 3 games: ${unlockedGameIds.slice(0, 3).join(', ')}`);
    }

    console.log('\n✅ All children initialized!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initializeChildrenPlayerLevels();
