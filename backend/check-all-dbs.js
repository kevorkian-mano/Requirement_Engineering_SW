const mongoose = require('mongoose');

async function checkDatabases() {
  try {
    // Connect to MongoDB admin
    const conn = await mongoose.connect('mongodb://localhost:27017/admin', { authSource: 'admin' });
    
    const admin = conn.connection.getClient().db('admin');
    const dbs = await admin.admin().listDatabases();
    
    console.log('Available databases:');
    dbs.databases.forEach(db => {
      console.log(`  - ${db.name}`);
    });
    
    // Check each database for games
    console.log('\n=== Checking each database for games ===');
    
    for (const db of dbs.databases) {
      const gameConn = await mongoose.connect(`mongodb://localhost:27017/${db.name}`);
      try {
        const Game = gameConn.model('Game', new mongoose.Schema({}, { strict: false }));
        const count = await Game.countDocuments();
        if (count > 0) {
          console.log(`\n${db.name}: ${count} games found`);
          const sample = await Game.findOne().select('title');
          if (sample) {
            console.log(`  Sample: ${sample.title}`);
          }
        }
      } catch (e) {
        // Collection might not exist
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDatabases();
