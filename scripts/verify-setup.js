
// Since we're using TypeScript files, we need to import the compiled versions
// or use a different approach. Let's test the connection directly with postgres
import postgres from 'postgres'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function verifySetup() {
  try {
    console.log('🔍 Verifying database setup...')
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required')
    }
    
    // Test 1: Connection test
    console.log('1. Testing database connection...')
    const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false })
    
    // Test basic connection
    const connectionTest = await client`SELECT NOW() as current_time`
    console.log('✅ Database connection successful!')
    
    // Test 2: Check if users table exists
    console.log('2. Checking if users table exists...')
    const tableCheck = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `
    
    if (tableCheck[0].exists) {
      console.log('✅ Users table exists!')
      
      // Test 3: Check table structure
      console.log('3. Checking table structure...')
      const columns = await client`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `
      console.log(`✅ Table structure verified! Found ${columns.length} columns`)
      
      // Test 4: Count existing users
      console.log('4. Checking existing data...')
      const userCount = await client`SELECT COUNT(*) FROM users`
      console.log(`✅ Found ${userCount[0].count} users in database`)
      
      console.log('\n🎉 Database setup verification complete!')
      console.log('Your signup functionality should now work correctly.')
    } else {
      console.log('❌ Users table does not exist!')
      console.log('\n📝 Please run the SQL script manually in your Supabase SQL Editor:')
      console.log('   1. Go to your Supabase dashboard')
      console.log('   2. Navigate to SQL Editor')
      console.log('   3. Copy and paste the content from scripts/manual-setup.sql')
      console.log('   4. Click "Run" to execute the script')
    }
    
    await client.end()
    
  } catch (error) {
    console.error('❌ Setup verification failed:', error)
    console.error('Error details:', error.message)
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n🔧 Connection issue detected. Please check:')
      console.error('1. Your DATABASE_URL in environment variables')
      console.error('2. Your Supabase project is active')
      console.error('3. Your network connection')
    } else if (error.message.includes('DATABASE_URL')) {
      console.error('\n🔧 Please set your DATABASE_URL environment variable')
    }
  }
  
  process.exit(0)
}

verifySetup()
