import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

console.log('🔍 DATABASE INITIALIZATION - Comprehensive Debugging')
console.log('📍 Current working directory:', process.cwd())
console.log('🌍 NODE_ENV:', process.env.NODE_ENV || 'not set')
console.log('⏰ Process start time:', new Date().toISOString())
console.log('🔄 Fresh environment check - Process PID:', process.pid)

if (!process.env.DATABASE_URL) {
  console.error('❌ CRITICAL: DATABASE_URL environment variable is missing!')
  console.error('🔍 Available env vars starting with DB:', Object.keys(process.env).filter(k => k.startsWith('DB')))
  throw new Error('DATABASE_URL environment variable is required')
}

// SECURE: Mask password in logs - NEVER log credentials
const dbUrl = process.env.DATABASE_URL
const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@')
const hostname = dbUrl.match(/@([^:]+):/)?.[1] || 'hostname-not-found'
const port = dbUrl.match(/:(\d+)\//)?.[1] || 'port-not-found'
const database = dbUrl.split('/').pop() || 'database-not-found'

console.log('✅ DATABASE_URL loaded successfully')
console.log('🔗 Masked URL:', maskedUrl)
console.log('🌐 Target hostname:', hostname)
console.log('🔌 Target port:', port)
console.log('💾 Target database:', database)
console.log('🚀 Supabase connection mode: SSL required, prepared statements disabled')

// For production/deployment, disable prepared statements for better compatibility with connection poolers
const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString, {
  max: 1,
  prepare: false, // Disable prepared statements for Supabase compatibility
  ssl: 'require', // Require SSL for Supabase connection
})

export const db = drizzle(client, { schema })