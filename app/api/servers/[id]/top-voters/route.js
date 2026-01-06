import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase.js'

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const serverId = resolvedParams?.id
    
    if (!serverId) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 })
    }
    
    // Get monthly top voters for this server
    const { data, error } = await supabaseAdmin
      .from('monthly_top_voters')
      .select('*')
      .eq('serverId', serverId)
      .order('voteCount', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('Error fetching top voters:', error)
      return NextResponse.json({ error: 'Failed to fetch top voters' }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
