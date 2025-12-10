const mongoose = require('mongoose');

async function checkEasyGamesByAge() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const gameSchema = new mongoose.Schema({}, { strict: false });
    const Game = mongoose.model('Game', gameSchema, 'games');
    
    const ageGroups = ['3-5', '6-8', '9-12'];
    
    for (const ageGroup of ageGroups) {
      const easyGames = await Game.find({
        isActive: true,
        difficulty: 'easy',
        ageGroups: { $in: [ageGroup] },
      });
      
      console.log(`\nAge Group ${ageGroup}: ${easyGames.length} easy games`);
      easyGames.forEach(g => {
        console.log(`  - ${g.title} (${g.ageGroups.join(', ')})`);
      });
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEasyGamesByAge();
