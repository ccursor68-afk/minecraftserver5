import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '../../../../lib/supabase.js'

// GET /api/hostings/:id - Get hosting by ID with reviews
export async function GET(request, { params }) {
  try {
    const hostingId = params.id
    
    // Get hosting
    const { data: hosting, error: hostingError } = await supabaseAdmin
      .from('hostings')
      .select('*')
      .eq('id', hostingId)
      .single()
    
    if (hostingError) {
      console.error('Error fetching hosting:', hostingError)
      return NextResponse.json({ error: 'Hosting not found' }, { status: 404 })
    }
    
    // Get reviews
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('hosting_reviews')
      .select('*')
      .eq('hosting_id', hostingId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
    
    return NextResponse.json({
      ...hosting,
      reviews: reviews || []
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/hostings/:id - Update hosting (admin only)
export async function PATCH(request, { params }) {
  try {
    const hostingId = params.id
    const body = await request.json()
    
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }
    
    // Remove fields that shouldn't be updated directly
    delete updateData.id
    delete updateData.avg_performance
    delete updateData.avg_support
    delete updateData.avg_price_value
    delete updateData.avg_overall
    delete updateData.review_count
    
    const { data, error } = await supabaseAdmin
      .from('hostings')
      .update(updateData)
      .eq('id', hostingId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating hosting:', error)
      return NextResponse.json({ error: 'Failed to update hosting' }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/hostings/:id - Delete hosting (admin only)
export async function DELETE(request, { params }) {
  try {
    const hostingId = params.id
    
    // Delete reviews first
    await supabaseAdmin
      .from('hosting_reviews')
      .delete()
      .eq('hosting_id', hostingId)
    
    // Delete hosting
    const { error } = await supabaseAdmin
      .from('hostings')
      .delete()
      .eq('id', hostingId)
    
    if (error) {
      console.error('Error deleting hosting:', error)
      return NextResponse.json({ error: 'Failed to delete hosting' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Hosting deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
