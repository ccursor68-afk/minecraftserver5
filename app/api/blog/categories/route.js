import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.js'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_categories')
      .select('*')
      .order('position', { ascending: true })
    
    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
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
    
    // Prepare category data - only include fields that exist in the table
    // Note: createdAt and updatedAt are handled by database defaults
    const categoryData = {
      id: categoryId,
      name: body.name,
      slug: body.slug.toLowerCase().trim(),
      description: body.description || null,
      icon: body.icon || '📁',
      color: body.color || '#22c55e',
      parentId: body.parentId || null,
      position: parseInt(body.position) || 0,
      isActive: true,
      topicCount: 0,
      postCount: 0
    }
    
    // Insert category
    // Note: Based on your database schema, createdAt/updatedAt columns may not exist
    // If you get a schema cache error, run supabase_blog_categories_fix.sql first
    const { data, error } = await supabaseAdmin
      .from('blog_categories')
      .insert([categoryData])
      .select('id, name, slug, description, icon, color, "parentId", position, "isActive", "topicCount", "postCount"')
      .single()
    
    if (error) {
      console.error('Error creating category:', error)
      console.error('Category data:', categoryData)
      
      // If error is about missing column (createdAt/updatedAt), provide helpful message
      if (error.message && (error.message.includes('column') || error.message.includes('schema cache') || error.message.includes('createdAt'))) {
        return NextResponse.json({ 
          error: 'Database schema issue - Missing columns',
          details: error.message,
          hint: 'The blog_categories table is missing createdAt/updatedAt columns. Please run supabase_blog_categories_fix.sql in your Supabase SQL Editor to add them.',
          solution: 'Run the SQL fix file: supabase_blog_categories_fix.sql',
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