const mongoose = require('mongoose');

async function checkPlayerLevels() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const playerLevelSchema = new mongoose.Schema({}, { strict: false });
    const PlayerLevel = mongoose.model('PlayerLevel', playerLevelSchema, 'playerlevels');
    
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema, 'users');
    
    // Get all users
    const allUsers = await User.find().select({ _id: 1, email: 1, role: 1, ageGroup: 1 });
    console.log('Total users:', allUsers.length);
    console.log('All users:', allUsers);
    
    // Get all player levels
    const allPlayerLevels = await PlayerLevel.find();
    console.log('\nTotal player levels:', allPlayerLevels.length);
    
    if (allPlayerLevels.length > 0) {
      console.log('\nPlayer levels:');
      allPlayerLevels.forEach(pl => {
        console.log({
          userId: pl.userId,
          currentLevel: pl.currentLevel,
          unlockedGamesCount: pl.unlockedGames?.length || 0,
          unlockedGames: pl.unlockedGames,
          ageGroup: pl.ageGroup,
        });
      });
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPlayerLevels();
