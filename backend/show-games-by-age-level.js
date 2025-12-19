const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:27017/play-learn-protect';

const gameSchema = new mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', gameSchema, 'games');

async function showGamesByAgeAndLevel() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB\n');

    const games = await Game.find({ isActive: true }).lean();
    
    const ageGroups = ['3-5', '6-8', '9-12'];
    const difficulties = ['easy', 'medium', 'hard'];

    console.log('📊 GAME DISTRIBUTION BY AGE GROUP AND DIFFICULTY\n');
    console.log('=' .repeat(80));

    for (const ageGroup of ageGroups) {
      console.log(`\n👶 AGE GROUP: ${ageGroup}`);
      console.log('-'.repeat(80));

      for (const difficulty of difficulties) {
        const filtered = games.filter(g => 
          g.ageGroups.includes(ageGroup) && g.difficulty === difficulty
        );

        console.log(`\n  📚 ${difficulty.toUpperCase()} (${filtered.length} games):`);
        
        if (filtered.length === 0) {
          console.log(`     (No games)`);
        } else {
          filtered.forEach((game, idx) => {
            console.log(`     ${idx + 1}. ${game.title} - ${game.category}`);
          });
        }
      }

      // Summary
      const easyCount = games.filter(g => g.ageGroups.includes(ageGroup) && g.difficulty === 'easy').length;
      const mediumCount = games.filter(g => g.ageGroups.includes(ageGroup) && g.difficulty === 'medium').length;
      const hardCount = games.filter(g => g.ageGroups.includes(ageGroup) && g.difficulty === 'hard').length;
      const total = easyCount + mediumCount + hardCount;

      console.log(`\n  📈 SUBTOTAL: ${total} games (Easy: ${easyCount}, Medium: ${mediumCount}, Hard: ${hardCount})`);
    }

    // Overall summary
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 OVERALL SUMMARY:');
    
    for (const difficulty of difficulties) {
      const count = games.filter(g => g.difficulty === difficulty).length;
      console.log(`   ${difficulty.toUpperCase()}: ${count} games`);
    }
    
    console.log(`   TOTAL: ${games.length} games`);

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showGamesByAgeAndLevel();
