const mongoose = require('mongoose');

async function updateEasyGamesForAge912() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const gameSchema = new mongoose.Schema({}, { strict: false });
    const Game = mongoose.model('Game', gameSchema, 'games');
    
    console.log('\n🔄 === UPDATING EASY GAMES FOR AGE 9-12 ===\n');
    
    // Games to update - add '9-12' to their ageGroups
    const gamesToUpdate = [
      'Number Adventure',
      'Gravity Playground',
      'Word Builder',
      'Code Blocks Adventure',
      'Scratch Basics',
      'Shape Explorer',
      'Ancient Egypt Explorer'
    ];
    
    for (const title of gamesToUpdate) {
      const game = await Game.findOne({ title });
      if (!game) {
        console.log(`❌ Not found: ${title}`);
        continue;
      }
      
      // Check if 9-12 is already in ageGroups
      if (game.ageGroups.includes('9-12')) {
        console.log(`✓ Already includes 9-12: ${title}`);
        continue;
      }
      
      // Add 9-12 to ageGroups using $addToSet to avoid duplicates
      const updated = await Game.findByIdAndUpdate(
        game._id,
        { $addToSet: { ageGroups: '9-12' } },
        { new: true }
      );
      console.log(`✅ Updated: ${title} | Ages: ${updated.ageGroups.join(', ')}`);
    }
    
    console.log('\n📊 === VERIFICATION ===\n');
    
    // Verify age 9-12 easy games
    const easyGames912 = await Game.find({
      difficulty: 'easy',
      ageGroups: { $in: ['9-12'] },
      isActive: true
    }).select('title ageGroups difficulty');
    
    console.log(`Easy games available for age 9-12: ${easyGames912.length}`);
    easyGames912.forEach(g => {
      console.log(`  - ${g.title} | Ages: ${g.ageGroups.join(', ')}`);
    });
    
    await mongoose.connection.close();
    console.log('\n✨ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateEasyGamesForAge912();
