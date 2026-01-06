import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase.js'

// GET /api/banners - Get all banners (admin)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('createdAt', { ascending: false })
    
    if (error) {
      console.error('Error fetching banners:', error)
      return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/banners - Create new banner
export async function POST(request) {
  try {
    const body = await request.json()
    
    if (!body.serverName || !body.imageUrl || !body.position || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const bannerId = `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const bannerData = {
      id: bannerId,
      serverName: body.serverName,
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl || null,
      position: body.position,
      startDate: body.startDate,
      endDate: body.endDate,
      isActive: body.isActive !== undefined ? body.isActive : true
    }
    
    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert([bannerData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating banner:', error)
      return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/banners?id=X - Update banner
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url)
    const bannerId = searchParams.get('id')
    
    if (!bannerId) {
      return NextResponse.json({ error: 'Banner ID required' }, { status: 400 })
    }
    
    const body = await request.json()
    
    const updateData = {}
    if (body.serverName !== undefined) updateData.serverName = body.serverName
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
    if (body.linkUrl !== undefined) updateData.linkUrl = body.linkUrl
    if (body.position !== undefined) updateData.position = body.position
    if (body.startDate !== undefined) updateData.startDate = body.startDate
    if (body.endDate !== undefined) updateData.endDate = body.endDate
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    
    const { data, error } = await supabaseAdmin
      .from('banners')
      .update(updateData)
      .eq('id', bannerId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating banner:', error)
      return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/banners?id=X - Delete banner
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const bannerId = searchParams.get('id')
    
    if (!bannerId) {
      return NextResponse.json({ error: 'Banner ID required' }, { status: 400 })
    }
    
    const { error } = await supabaseAdmin
      .from('banners')
      .delete()
      .eq('id', bannerId)
    
    if (error) {
      console.error('Error deleting banner:', error)
      return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Banner deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}