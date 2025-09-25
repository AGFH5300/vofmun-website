const { db } = require('../lib/db/index.js');
const { users } = require('../lib/db/schema.js');

async function createSchema() {
  try {
    console.log('Testing database connection...');
    
    // Test connection with a simple query
    const result = await db.execute('SELECT 1 as test');
    console.log('✓ Database connection successful');
    
    // Create the users table by running a select (this will fail if table doesn't exist)
    try {
      await db.select().from(users).limit(1);
      console.log('✓ Users table already exists');
    } catch (error) {
      console.log('✗ Users table does not exist, need to create it');
      throw new Error('Table does not exist - please run schema migration in Supabase dashboard');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database error:', error.message);
    process.exit(1);
  }
}

createSchema();