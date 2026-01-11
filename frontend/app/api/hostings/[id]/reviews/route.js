import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '../../../../../lib/supabase.js'

// GET /api/hostings/:id/reviews - Get reviews for a hosting
export async function GET(request, { params }) {
  try {
    const hostingId = params.id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0
    
    const { data, error } = await supabaseAdmin
      .from('hosting_reviews')
      .select('*')
      .eq('hosting_id', hostingId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hostings/:id/reviews - Add a review
export async function POST(request, { params }) {
  try {
    const hostingId = params.id
    const body = await request.json()
    
    // Validate required fields
    if (!body.user_id || !body.comment) {
      return NextResponse.json({ error: 'User ID and comment are required' }, { status: 400 })
    }
    
    if (!body.performance_rating || !body.support_rating || !body.price_value_rating) {
      return NextResponse.json({ error: 'All ratings are required' }, { status: 400 })
    }
    
    // Validate rating values
    const ratings = [body.performance_rating, body.support_rating, body.price_value_rating]
    for (const rating of ratings) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Ratings must be between 1 and 5' }, { status: 400 })
      }
    }
    
    // Check if user already reviewed this hosting
    const { data: existingReview } = await supabaseAdmin
      .from('hosting_reviews')
      .select('id')
      .eq('hosting_id', hostingId)
      .eq('user_id', body.user_id)
      .single()
    
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this hosting' }, { status: 400 })
    }
    
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const reviewData = {
      id: reviewId,
      hosting_id: hostingId,
      user_id: body.user_id,
      user_email: body.user_email || null,
      performance_rating: body.performance_rating,
      support_rating: body.support_rating,
      price_value_rating: body.price_value_rating,
      title: body.title || null,
      comment: body.comment,
      is_approved: true, // Auto-approve for now
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabaseAdmin
      .from('hosting_reviews')
      .insert([reviewData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating review:', error)
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
