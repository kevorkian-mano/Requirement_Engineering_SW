const mongoose = require('mongoose');

const connectionString = 'mongodb://localhost:27017/play-learn-protect';

const gameSchema = new mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', gameSchema, 'games');

async function removeAllGames() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');

    const result = await Game.deleteMany({});
    console.log(`\n🗑️  Deleted ${result.deletedCount} games from database`);

    const count = await Game.countDocuments();
    console.log(`📊 Remaining games: ${count}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

removeAllGames();
