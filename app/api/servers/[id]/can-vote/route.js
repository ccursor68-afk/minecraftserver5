import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase.js'

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const serverId = resolvedParams?.id
    
    if (!serverId) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 })
    }
    
    // Get user IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Check last vote from this IP for this server
    const { data: lastVote, error } = await supabaseAdmin
      .from('votes')
      .select('createdAt')
      .eq('serverId', serverId)
      .eq('ipAddress', ip)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking vote status:', error)
      return NextResponse.json({ error: 'Failed to check vote status' }, { status: 500 })
    }
    
    // If no previous vote, user can vote
    if (!lastVote) {
      return NextResponse.json({ canVote: true, timeLeft: 0 })
    }
    
    // Check if 24 hours have passed
    const lastVoteTime = new Date(lastVote.createdAt).getTime()
    const now = Date.now()
    const timeDiff = now - lastVoteTime
    const hoursPassed = timeDiff / (1000 * 60 * 60)
    
    if (hoursPassed >= 24) {
      return NextResponse.json({ canVote: true, timeLeft: 0 })
    } else {
      const timeLeft = (24 * 60 * 60 * 1000) - timeDiff
      return NextResponse.json({ 
        canVote: false, 
        timeLeft: timeLeft,
        message: `You can vote again in ${Math.ceil((24 - hoursPassed))} hours`
      })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}