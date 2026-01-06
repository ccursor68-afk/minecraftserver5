import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase.js'

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params
    const serverId = resolvedParams?.id
    
    if (!serverId) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 })
    }
    
    const body = await request.json()
    const { minecraftUsername } = body
    
    if (!minecraftUsername || !minecraftUsername.trim()) {
      return NextResponse.json({ error: 'Minecraft username is required' }, { status: 400 })
    }
    
    // Get user IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Check if user can vote (24 hour cooldown)
    const { data: lastVote } = await supabaseAdmin
      .from('votes')
      .select('createdAt')
      .eq('serverId', serverId)
      .eq('ipAddress', ip)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single()
    
    if (lastVote) {
      const lastVoteTime = new Date(lastVote.createdAt).getTime()
      const now = Date.now()
      const hoursPassed = (now - lastVoteTime) / (1000 * 60 * 60)
      
      if (hoursPassed < 24) {
        return NextResponse.json({ 
          error: `You can vote again in ${Math.ceil(24 - hoursPassed)} hours` 
        }, { status: 429 })
      }
    }
    
    // Create vote record
    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const { data: vote, error: voteError } = await supabaseAdmin
      .from('votes')
      .insert([{
        id: voteId,
        serverId: serverId,
        minecraftUsername: minecraftUsername.trim(),
        ipAddress: ip,
        votifierSent: false
      }])
      .select()
      .single()
    
    if (voteError) {
      console.error('Error creating vote:', voteError)
      return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
    }
    
    // TODO: Send to Votifier (Minecraft server notification)
    // This would require server's Votifier configuration
    // For now, we just record the vote
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vote recorded successfully!',
      vote: vote
    }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}