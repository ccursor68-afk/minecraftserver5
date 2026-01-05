import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.js'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const categorySlug = searchParams.get('categorySlug')
  
  try {
    let query = supabaseAdmin
      .from('blog_posts')
      .select('*')
      .order('isPinned', { ascending: false })
      .order('createdAt', { ascending: false })
    
    if (categorySlug) {
      query = query.eq('categorySlug', categorySlug)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
        replyCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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