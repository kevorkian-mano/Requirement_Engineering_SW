const mongoose = require('mongoose');

async function checkEasyGames() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const gameSchema = new mongoose.Schema({}, { strict: false });
    const Game = mongoose.model('Game', gameSchema, 'games');
    
    console.log('\n🔍 === CHECKING EASY GAMES BY AGE GROUP ===\n');
    
    const ageGroups = ['3-5', '6-8', '9-12'];
    
    for (const ageGroup of ageGroups) {
      console.log(`📚 Age Group: ${ageGroup}`);
      
      // Find easy games for this age group
      const easyGames = await Game.find({
        difficulty: 'easy',
        ageGroups: { $in: [ageGroup] },
        isActive: true
      }).select('title titleArabic difficulty ageGroups pointsReward _id');
      
      if (easyGames.length === 0) {
        console.log(`   ❌ NO EASY GAMES FOUND for age ${ageGroup}`);
      } else {
        console.log(`   ✅ Found ${easyGames.length} easy games:`);
        easyGames.forEach(game => {
          console.log(`      - ${game.title} (${game.titleArabic}) | ID: ${game._id}`);
        });
      }
      console.log('');
    }
    
    // Check total game stats
    console.log('📊 === TOTAL GAME STATISTICS ===\n');
    const totalGames = await Game.countDocuments();
    const easyCount = await Game.countDocuments({ difficulty: 'easy' });
    const mediumCount = await Game.countDocuments({ difficulty: 'medium' });
    const hardCount = await Game.countDocuments({ difficulty: 'hard' });
    
    console.log(`Total games: ${totalGames}`);
    console.log(`Easy games: ${easyCount}`);
    console.log(`Medium games: ${mediumCount}`);
    console.log(`Hard games: ${hardCount}`);
    
    // Check what games exist with ageGroups
    console.log('\n📋 === ALL GAMES WITH AGE GROUPS ===\n');
    const allGames = await Game.find().select('title difficulty ageGroups _id').sort({ createdAt: 1 });
    allGames.forEach(game => {
      console.log(`${game.title} | Difficulty: ${game.difficulty} | Ages: ${game.ageGroups.join(', ')} | ID: ${game._id}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkEasyGames();
