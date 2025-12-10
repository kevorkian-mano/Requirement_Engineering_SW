const mongoose = require('mongoose');

async function getAllGames() {
  try {
    await mongoose.connect('mongodb://localhost:27017/play-learn-protect');
    
    const gameSchema = new mongoose.Schema({}, { strict: false });
    const Game = mongoose.model('Game', gameSchema, 'games');
    
    // Get all games sorted by age group and difficulty
    const allGames = await Game.find({ isActive: true }).sort({ ageGroups: 1, difficulty: 1 });
    
    console.log('=== ALL GAMES BREAKDOWN ===\n');
    
    // Group by age group
    const ageGroups = ['3-5', '6-8', '9-12'];
    
    for (const ageGroup of ageGroups) {
      const gamesForAge = allGames.filter(g => g.ageGroups.includes(ageGroup));
      console.log(`\n### AGE GROUP: ${ageGroup}`);
      console.log(`Total games: ${gamesForAge.length}\n`);
      
      // Group by difficulty
      const difficulties = ['easy', 'medium', 'hard'];
      for (const difficulty of difficulties) {
        const gamesForDifficulty = gamesForAge.filter(g => g.difficulty === difficulty);
        console.log(`  ${difficulty.toUpperCase()}: ${gamesForDifficulty.length} games`);
        gamesForDifficulty.forEach(g => {
          console.log(`    - ${g.title} (${g.category})`);
        });
      }
    }
    
    // Print all games in detail
    console.log('\n\n=== DETAILED GAME LIST ===\n');
    allGames.forEach(g => {
      console.log(JSON.stringify({
        title: g.title,
        titleArabic: g.titleArabic,
        category: g.category,
        difficulty: g.difficulty,
        ageGroups: g.ageGroups,
        pointsReward: g.pointsReward,
      }, null, 2));
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getAllGames();
