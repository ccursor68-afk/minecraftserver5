import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.js'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')
  const categorySlug = searchParams.get('categorySlug')
  
  try {
    let query = supabaseAdmin
      .from('blog_posts')
      .select('*')
    
    // Note: Status filter removed - if your table has a status column and you want to filter,
    // uncomment the line below: query = query.eq('status', 'published')
    
    // Filter by categoryId if provided
    if (categoryId) {
      query = query.eq('categoryId', categoryId)
    } 
    // If categorySlug is provided, first get the category ID
    else if (categorySlug) {
      const { data: category, error: catError } = await supabaseAdmin
        .from('blog_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()
      
      if (catError || !category) {
        console.error('Category lookup error:', catError)
        return NextResponse.json({ error: 'Category not found', details: catError?.message }, { status: 404 })
      }
      
      query = query.eq('categoryId', category.id)
    }
    
    // Order by isPinned first, then by createdAt if it exists
    try {
      query = query.order('isPinned', { ascending: false })
      query = query.order('createdAt', { ascending: false })
    } catch (e) {
      // If ordering fails, just continue without ordering
      console.warn('Ordering may have failed:', e)
    }
    
    const { data, error } = await query
    
    console.log('Posts query result:', { data: data?.length, error, categorySlug, categoryId })
    
    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts', details: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    if (!body.categoryId || !body.userId || !body.title || !body.content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert([{
        id: postId,
        categoryId: body.categoryId,
        userId: body.userId,
        title: body.title,
        slug,
        content: body.content,
        excerpt: body.excerpt || body.content.substring(0, 200),
        tags: body.tags || [],
        status: 'published',
        isPinned: body.isPinned || false,
        isLocked: body.isLocked || false,
        viewCount: 0,
        replyCount: 0
        // createdAt and updatedAt will be set by database defaults if columns exist
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}