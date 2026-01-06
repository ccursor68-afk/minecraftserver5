import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase.js'

// GET /api/banners/active - Get active banners for public display
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const position = searchParams.get('position')
  
  try {
    let query = supabase
      .from('banners')
      .select('*')
      .eq('isActive', true)
      .lte('startDate', new Date().toISOString().split('T')[0])
      .gte('endDate', new Date().toISOString().split('T')[0])
    
    if (position) {
      query = query.eq('position', position)
    }
    
    query = query.order('createdAt', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching active banners:', error)
      return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/banners/active/track - Track banner click
export async function POST(request) {
  try {
    const body = await request.json()
    const { bannerId } = body
    
    if (!bannerId) {
      return NextResponse.json({ error: 'Banner ID required' }, { status: 400 })
    }
    
    // This would typically increment click count
    // For now, just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}