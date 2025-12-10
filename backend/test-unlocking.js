const mongoose = require('mongoose');

async function testUnlocking() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const playerLevelSchema = new mongoose.Schema({}, { strict: false });
    const PlayerLevel = mongoose.model('PlayerLevel', playerLevelSchema, 'playerlevels');
    
    console.log('Before initialization:');
    let count = await PlayerLevel.countDocuments();
    console.log('PlayerLevels count:', count);
    
    // Now the backend should auto-initialize when /levels/me/unlocked-games is called
    // Let's just verify the schema is correct
    const samplePlayerLevel = {
      userId: new mongoose.Types.ObjectId('6934c71001d851dd6737a8ab'), // child1.parent1@yahoo.com (age 6-8)
      currentLevel: 1,
      currentXP: 0,
      totalXPEarned: 0,
      xpNeededForNextLevel: 1,
      totalPoints: 0,
      unlockedGames: [
        '69331d1b3a4c724548eb8e09', // Number Adventure
        '69331d1b3a4c724548eb8e16', // Gravity Playground
        '69331d1b3a4c724548eb8e1f', // Element Explorer
        '69331d1b3a4c724548eb8e25', // Word Builder
        '69331d1b3a4c724548eb8e2b', // Code Blocks Adventure
        '69331f2a56eeb4ef4cb1f2e2', // Counting Fun
        '69331f2a56eeb4ef4cb1f2e5', // Shape Explorer
        '69331f2a56eeb4ef4cb1f2ee', // Alphabet Journey
        '69331f2a56eeb4ef4cb1f2fa', // Scratch Basics
        '69331f2a56eeb4ef4cb1f303', // Ancient Egypt Explorer
      ],
      lockedGames: [],
      currentLevelTitle: 'Level 1',
      currentLevelDescription: 'Beginner',
      nextLevelTitle: 'Level 2',
      nextLevelDescription: 'Intermediate',
      ageGroup: '6-8',
    };
    
    console.log('\nInserting sample player level for testing...');
    const created = await PlayerLevel.create(samplePlayerLevel);
    console.log('Created:', { _id: created._id, unlockedGamesCount: created.unlockedGames.length });
    
    console.log('\nAfter manual insertion:');
    count = await PlayerLevel.countDocuments();
    console.log('PlayerLevels count:', count);
    
    // Verify retrieval
    const retrieved = await PlayerLevel.findById(created._id);
    console.log('Retrieved:', {
      _id: retrieved._id,
      currentLevel: retrieved.currentLevel,
      unlockedGamesCount: retrieved.unlockedGames.length,
      firstUnlockedGame: retrieved.unlockedGames[0],
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testUnlocking();
