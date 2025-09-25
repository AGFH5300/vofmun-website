
import postgres from 'postgres'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required')
    }
    
    const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false })
    
    // Test basic connection
    const result = await client`SELECT NOW() as current_time`
    console.log('✅ Database connection successful!')
    
    // Test if users table exists
    const tableExists = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `
    
    if (tableExists[0].exists) {
      const userCount = await client`SELECT COUNT(*) FROM users`
      console.log(`✅ Found ${userCount[0].count} users in the database`)
    } else {
      console.log('ℹ️ Users table not found - you may need to run setup first')
    }
    
    await client.end()
    console.log('\nDatabase is ready for use!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

testConnection()
