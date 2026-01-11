import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase.js'

// GET /api/servers - Get all approved servers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const platform = searchParams.get('platform')
    const search = searchParams.get('search')
    
    let query = supabaseAdmin
      .from('servers')
      .select('*')
      .eq('approvalStatus', 'approved')
      .order('voteCount', { ascending: false })
    
    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    if (platform && platform !== 'all') {
      query = query.eq('platform', platform)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,ip.ilike.%${search}%,shortDescription.ilike.%${search}%`)
    }
    
    const { data, error } = await query
    
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

// POST /api/servers - Create a new server (requires authentication)
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Generate unique server ID
    const serverId = `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const serverData = {
      id: serverId,
      name: body.name,
      ip: body.ip,
      port: body.port || 25565,
      website: body.website || null,
      discord: body.discord || null,
      bannerUrl: body.bannerUrl || null,
      shortDescription: body.shortDescription,
      longDescription: body.longDescription || '',
      version: body.version || '1.21',
      category: body.category || 'Survival',
      platform: body.platform || 'java',
      status: 'online',
      onlinePlayers: 0,
      maxPlayers: body.maxPlayers || 100,
      voteCount: 0,
      ownerId: body.ownerId || null,
      votifierIp: body.votifierIp || null,
      votifierPort: body.votifierPort || 8192,
      votifierPublicKey: body.votifierPublicKey || null,
      approvalStatus: 'pending',
      isfeatured: false,
      featureduntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const { data, error } = await supabaseAdmin
      .from('servers')
      .insert([serverData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating server:', error)
      return NextResponse.json({ error: 'Failed to create server', details: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
