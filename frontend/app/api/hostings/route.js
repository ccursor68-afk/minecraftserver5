import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '../../../lib/supabase.js'

// GET /api/hostings - Get all hostings sorted by rating
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const sortBy = searchParams.get('sortBy') || 'avg_overall'
    
    let query = supabaseAdmin
      .from('hostings')
      .select('*')
      .eq('is_active', true)
    
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }
    
    // Sort by rating
    query = query.order(sortBy, { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching hostings:', error)
      return NextResponse.json({ error: 'Failed to fetch hostings' }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hostings - Create new hosting (admin only)
export async function POST(request) {
  try {
    const body = await request.json()
    
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    
    const hostingId = `hosting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const hostingData = {
      id: hostingId,
      name: body.name,
      logo_url: body.logo_url || null,
      website: body.website || null,
      description: body.description || '',
      short_description: body.short_description || '',
      features: body.features || [],
      min_price: body.min_price || 0,
      max_price: body.max_price || 0,
      currency: body.currency || 'TRY',
      is_featured: body.is_featured || false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabaseAdmin
      .from('hostings')
      .insert([hostingData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating hosting:', error)
      return NextResponse.json({ error: 'Failed to create hosting' }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
