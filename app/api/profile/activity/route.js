import { NextResponse } from 'next/server'
import { supabaseAdmin, createServerSupabaseClient } from '../../../../lib/supabase.js'

// GET /api/profile/activity - Get user activity history
export async function GET(request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const { data, error } = await supabaseAdmin
      .from('user_activity')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching activity:', error)
      return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/profile/activity - Create activity log
export async function POST(request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    if (!body.activityType || !body.description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const { data, error } = await supabaseAdmin
      .from('user_activity')
      .insert([{
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        activityType: body.activityType,
        description: body.description
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating activity:', error)
      return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}