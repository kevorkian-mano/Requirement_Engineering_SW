const mongoose = require('mongoose');

async function addGames() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const gameSchema = new mongoose.Schema({}, { strict: false });
    const Game = mongoose.model('Game', gameSchema, 'games');
    
    const newGames = [
      {
        title: 'Pattern Play',
        titleArabic: 'لعبة الأنماط',
        description: 'Complete colorful patterns by choosing the right shape!',
        descriptionArabic: 'أكمل الأنماط الملونة بختيار الشكل الصحيح!',
        category: 'math',
        difficulty: 'medium',
        ageGroups: ['3-5'],
        pointsReward: 60,
        isActive: true,
        playCount: 0,
        averageScore: 0,
      },
      {
        title: 'Memory Match',
        titleArabic: 'مطابقة الذاكرة',
        description: 'Find matching pairs of animals and objects!',
        descriptionArabic: 'ابحث عن أزواج متطابقة من الحيوانات والأشياء!',
        category: 'math',
        difficulty: 'hard',
        ageGroups: ['3-5'],
        pointsReward: 80,
        isActive: true,
        playCount: 0,
        averageScore: 0,
      }
    ];
    
    for (const game of newGames) {
      // Check if game already exists
      const exists = await Game.findOne({ title: game.title });
      if (exists) {
        console.log(`Game "${game.title}" already exists, skipping...`);
        continue;
      }
      
      const created = await Game.create(game);
      console.log(`✅ Created: ${created.title} (${created.difficulty}) - ID: ${created._id}`);
    }
    
    console.log('\n✨ Done!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addGames();
