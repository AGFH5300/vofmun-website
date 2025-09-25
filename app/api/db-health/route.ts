import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test basic connection by checking if we can access the users table
    const { data, error } = await supabase.from('users').select('id', { count: 'exact', head: true })
    
    if (error) {
      return NextResponse.json({
        status: 'unhealthy',
        error: `Supabase error: ${error.message}`,
        code: error.code,
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }
    
    return NextResponse.json({
      status: 'healthy',
      message: 'Supabase connection successful',
      timestamp: new Date().toISOString(),
      environment: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}