import { NextResponse } from 'next/server'
import { supabaseAdmin, createServerSupabaseClient } from '../../../lib/supabase.js'

// GET /api/profile - Get current user profile
export async function GET(request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user profile
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }
    
    // Get user's servers count
    const { count: serverCount } = await supabaseAdmin
      .from('servers')
      .select('id', { count: 'exact', head: true })
      .eq('ownerId', user.id)
    
    // Get total votes for user's servers
    const { data: servers } = await supabaseAdmin
      .from('servers')
      .select('voteCount')
      .eq('ownerId', user.id)
    
    const totalVotes = servers?.reduce((sum, s) => sum + (s.voteCount || 0), 0) || 0
    
    // Get user's open tickets count
    const { count: openTickets } = await supabaseAdmin
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('userId', user.id)
      .eq('status', 'open')
    
    return NextResponse.json({
      ...profile,
      stats: {
        serverCount: serverCount || 0,
        totalVotes: totalVotes,
        openTickets: openTickets || 0
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    console.log('Profile update request:', { userId: user.id, body })
    
    const updates = {}
    
    if (body.minecraftUsername !== undefined) {
      updates.minecraftUsername = body.minecraftUsername
      // Update avatar URL
      if (body.minecraftUsername) {
        updates.avatarUrl = `https://mc-heads.net/avatar/${body.minecraftUsername}/128`
      } else {
        updates.avatarUrl = null
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }
    
    console.log('Updating user with:', updates)
    
    // Update user profile
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json({ error: 'Failed to update profile', details: error.message }, { status: 500 })
    }
    
    console.log('Profile updated successfully:', data)
    
    // Log activity
    await supabaseAdmin
      .from('user_activity')
      .insert([{
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        activityType: 'profile_update',
        description: 'Profil bilgileri güncellendi'
      }])
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}