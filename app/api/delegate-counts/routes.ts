import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: delegates, error } = await supabase
      .from('users')
      .select('nationality')
      .eq('role', 'delegate')
    
    if (error) {
      throw error
    }
    
    const counts: Record<string, number> = {}
    
    delegates?.forEach((delegate) => {
      if (delegate.nationality) {
        const normalizedCode = delegate.nationality.toUpperCase()
        counts[normalizedCode] = (counts[normalizedCode] || 0) + 1
      }
    })
    
    return NextResponse.json({ counts }, { status: 200 })
  } catch (error) {
    console.error('Error fetching delegate counts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch delegate counts' },
      { status: 500 }
    )
  }
}
