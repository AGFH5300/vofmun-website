
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const connectionString = process.env.DATABASE_URL
const migrationClient = postgres(connectionString, { max: 1 })
const db = drizzle(migrationClient)

async function main() {
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: 'drizzle' })
  console.log('Migrations completed successfully!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
