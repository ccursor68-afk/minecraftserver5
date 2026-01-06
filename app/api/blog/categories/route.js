import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.js'

export async function GET() {
  try {
    // Get all categories
    const { data: categories, error } = await supabaseAdmin
      .from('blog_categories')
      .select('id, name, slug, description, icon, color')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
    
    // For each category, count posts and replies
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        // Count posts in this category
        const { count: postCount } = await supabaseAdmin
          .from('blog_posts')
          .select('id', { count: 'exact', head: true })
          .eq('categoryId', category.id)
        
        // Count total replies for all posts in this category
        const { data: posts } = await supabaseAdmin
          .from('blog_posts')
          .select('id')
          .eq('categoryId', category.id)
        
        let replyCount = 0
        if (posts && posts.length > 0) {
          const postIds = posts.map(p => p.id)
          const { count } = await supabaseAdmin
            .from('blog_replies')
            .select('id', { count: 'exact', head: true })
            .in('postId', postIds)
          replyCount = count || 0
        }
        
        return {
          ...category,
          topicCount: postCount || 0,
          postCount: replyCount || 0
        }
      })
    )
    
    return NextResponse.json(categoriesWithCounts)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: 'Missing required fields: name and slug are required' }, { status: 400 })
    }
    
    // Check if slug already exists
    const { data: existing } = await supabaseAdmin
      .from('blog_categories')
      .select('id')
      .eq('slug', body.slug)
      .single()
    
    if (existing) {
      return NextResponse.json({ 
        error: 'Category with this slug already exists',
        details: 'Please choose a different slug'
      }, { status: 409 })
    }
    
    const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Prepare category data - only include fields that exist in your table
    // Based on your schema, only these columns exist: id, name, slug, description, icon, color
    const categoryData = {
      id: categoryId,
      name: body.name,
      slug: body.slug.toLowerCase().trim(),
      description: body.description || null,
      icon: body.icon || '📁',
      color: body.color || '#22c55e'
    }
    
    // Insert category - only select columns that exist
    const { data, error } = await supabaseAdmin
      .from('blog_categories')
      .insert([categoryData])
      .select('id, name, slug, description, icon, color')
      .single()
    
    if (error) {
      console.error('Error creating category:', error)
      console.error('Category data:', categoryData)
      
      // If error is about missing column, provide helpful message
      if (error.message && (error.message.includes('column') || error.message.includes('schema cache'))) {
        return NextResponse.json({ 
          error: 'Database schema issue - Missing columns',
          details: error.message,
          hint: 'Your blog_categories table is missing some columns. The table should have: id, name, slug, description, icon, color. If you want additional columns (isActive, parentId, position, createdAt, updatedAt), run supabase_blog_categories_fix.sql in your Supabase SQL Editor.',
          solution: 'Option 1: Use only basic columns (current setup works with: id, name, slug, description, icon, color). Option 2: Run supabase_blog_categories_fix.sql to add all columns.',
          code: error.code || null
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to create category',
        details: error.message,
        hint: error.hint || null,
        code: error.code || null
      }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('id')
    
    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }
    
    // First, delete all posts in this category (cascade delete)
    const { error: postsError } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('categoryId', categoryId)
    
    if (postsError) {
      console.error('Error deleting category posts:', postsError)
      return NextResponse.json({ 
        error: 'Failed to delete category posts',
        details: postsError.message 
      }, { status: 500 })
    }
    
    // Then delete the category
    const { error: categoryError } = await supabaseAdmin
      .from('blog_categories')
      .delete()
      .eq('id', categoryId)
    
    if (categoryError) {
      console.error('Error deleting category:', categoryError)
      return NextResponse.json({ 
        error: 'Failed to delete category',
        details: categoryError.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}