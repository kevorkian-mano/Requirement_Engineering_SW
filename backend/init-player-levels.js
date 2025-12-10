const mongoose = require('mongoose');

async function initializePlayerLevels() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema, 'users');
    
    const gameSchema = new mongoose.Schema({}, { strict: false });
    const Game = mongoose.model('Game', gameSchema, 'games');
    
    const playerLevelSchema = new mongoose.Schema({}, { strict: false });
    const PlayerLevel = mongoose.model('PlayerLevel', playerLevelSchema, 'playerlevels');
    
    // Get all child users
    const children = await User.find({ role: 'child' });
    console.log(`Found ${children.length} children`);
    
    for (const child of children) {
      // Check if player level already exists
      const existingLevel = await PlayerLevel.findOne({ userId: child._id });
      
      if (existingLevel) {
        console.log(`Player level already exists for ${child.email}`);
        continue;
      }
      
      // Get ALL easy games for the child's age group
      const easyGames = await Game.find({
        isActive: true,
        difficulty: 'easy',
        ageGroups: { $in: [child.ageGroup] },
      });
      
      console.log(`\nInitializing ${child.email} (${child.ageGroup})`);
      console.log(`  Found ${easyGames.length} easy games`);
      
      const unlockedGameIds = easyGames.map(g => g._id.toString());
      
      // Create player level
      const playerLevel = await PlayerLevel.create({
        userId: child._id,
        currentLevel: 1,
        currentXP: 0,
        totalXPEarned: 0,
        xpNeededForNextLevel: 1,
        totalPoints: 0,
        unlockedGames: unlockedGameIds,
        lockedGames: [],
        currentLevelTitle: 'Level 1',
        currentLevelDescription: 'Beginner - All easy games unlocked',
        nextLevelTitle: 'Level 2',
        nextLevelDescription: 'Intermediate',
        ageGroup: child.ageGroup,
      });
      
      console.log(`  Created player level with ${playerLevel.unlockedGames.length} unlocked games`);
    }
    
    // Verify
    console.log('\n--- Verification ---');
    const allPlayerLevels = await PlayerLevel.find();
    console.log(`Total player levels: ${allPlayerLevels.length}`);
    
    for (const pl of allPlayerLevels) {
      const user = await User.findById(pl.userId);
      console.log(`  ${user?.email}: ${pl.unlockedGames.length} unlocked games`);
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

initializePlayerLevels();
