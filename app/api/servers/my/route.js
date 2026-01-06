import { NextResponse } from 'next/server'
import { supabaseAdmin, createServerSupabaseClient } from '../../../../lib/supabase.js'

// GET /api/servers/my - Get current user's servers
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data, error } = await supabaseAdmin
      .from('servers')
      .select('*')
      .eq('ownerId', user.id)
      .order('createdAt', { ascending: false })
    
    if (error) {
      console.error('Error fetching servers:', error)
      return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
