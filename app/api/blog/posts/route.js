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
      console.log('Filtering by categoryId:', categoryId)
    } 
    // If categorySlug is provided, first get the category ID
    else if (categorySlug) {
      console.log('Looking up category by slug:', categorySlug)
      const { data: category, error: catError } = await supabaseAdmin
        .from('blog_categories')
        .select('id, slug, name')
        .eq('slug', categorySlug)
        .single()
      
      console.log('Category lookup result:', { category, catError })
      
      if (catError || !category) {
        console.error('Category lookup error:', catError)
        return NextResponse.json({ error: 'Category not found', details: catError?.message }, { status: 404 })
      }
      
      console.log('Filtering posts by categoryId:', category.id, 'for category:', category.name)
      query = query.eq('categoryId', category.id)
      
      // Debug: Check all posts first
      const { data: allPosts } = await supabaseAdmin
        .from('blog_posts')
        .select('id, title, categoryId')
        .limit(10)
      
      console.log('Sample posts in database:', allPosts)
      console.log('Looking for posts with categoryId:', category.id)
    }
    
    // Order posts - try isPinned first, then createdAt, fallback to id
    // Supabase will ignore order() calls for non-existent columns
    query = query.order('isPinned', { ascending: false })
    query = query.order('createdAt', { ascending: false })
    // Fallback ordering by id if other columns don't exist
    query = query.order('id', { ascending: false })
    
    const { data, error } = await query
    
    console.log('Posts query result:', { 
      postCount: data?.length || 0, 
      error: error?.message, 
      categorySlug, 
      categoryId,
      samplePost: data?.[0] ? {
        id: data[0].id,
        title: data[0].title,
        categoryId: data[0].categoryId
      } : null
    })
    
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
    
    // Prepare post data - only include basic required fields
    const postData = {
      id: postId,
      categoryId: body.categoryId,
      userId: body.userId,
      title: body.title,
      slug,
      content: body.content
    }
    
    // Add optional fields if provided
    if (body.excerpt) {
      postData.excerpt = body.excerpt
    } else if (body.content) {
      postData.excerpt = body.content.substring(0, 200)
    }
    
    if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
      postData.tags = body.tags
    }
    
    console.log('Creating post with data:', postData)
    
    // Insert post - select only basic fields to avoid column errors
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert([postData])
      .select('id, categoryId, userId, title, slug, content, excerpt, tags')
      .single()
    
    if (error) {
      console.error('Error creating post:', error)
      console.error('Post data:', postData)
      return NextResponse.json({ 
        error: 'Failed to create post',
        details: error.message,
        hint: error.hint || null,
        code: error.code || null
      }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}