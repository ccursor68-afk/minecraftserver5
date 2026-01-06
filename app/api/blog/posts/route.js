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
      .eq('status', 'published')
      .order('isPinned', { ascending: false })
      // Order by createdAt if column exists, otherwise it will be ignored
      .order('createdAt', { ascending: false })
    
    // Filter by categoryId if provided
    if (categoryId) {
      query = query.eq('categoryId', categoryId)
    } 
    // If categorySlug is provided, first get the category ID
    else if (categorySlug) {
      const { data: category } = await supabaseAdmin
        .from('blog_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()
      
      if (category) {
        query = query.eq('categoryId', category.id)
      } else {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }
    }
    
    const { data, error } = await query
    
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