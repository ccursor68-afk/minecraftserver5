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
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { data, error } = await supabaseAdmin
      .from('blog_categories')
      .insert([{
        id: categoryId,
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        icon: body.icon || '📁',
        color: body.color || '#22c55e',
        parentId: body.parentId || null,
        position: body.position || 0,
        isActive: true,
        topicCount: 0,
        postCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}