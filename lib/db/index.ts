// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// For production/deployment, disable prepared statements for better compatibility with connection poolers
const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString, {
  max: 1,
  prepare: false, // Disable prepared statements for Supabase compatibility
  ssl: connectionString.includes('sslmode=disable') ? false : 'require', // Require SSL for Supabase connection unless sslmode=disable is present
})

export const db = drizzle(client, { schema })
