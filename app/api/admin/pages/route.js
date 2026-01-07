import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.js'

// Get all custom pages
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const published = searchParams.get('published')
  const footer = searchParams.get('footer')
  
  try {
    let query = supabaseAdmin
      .from('custom_pages')
      .select('*')
    
    if (published === 'true') {
      query = query.eq('isPublished', true)
    }
    
    if (footer === 'true') {
      query = query.eq('showInFooter', true)
    }
    
    query = query.order('footerorder', { ascending: true })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching pages:', error)
      // Return empty array if table doesn't exist
      if (error.code === 'PGRST205' || error.code === '42P01' || error.code === '42703') {
        return NextResponse.json([])
      }
      return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json([])
  }
}

// Create new page
export async function POST(request) {
  try {
    const body = await request.json()
    
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json({ error: 'Title, slug and content are required' }, { status: 400 })
    }
    
    const pageId = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { data, error } = await supabaseAdmin
      .from('custom_pages')
      .insert([{
        id: pageId,
        slug: body.slug,
        title: body.title,
        content: body.content,
        metadescription: body.metaDescription || '',
        ispublished: body.isPublished !== undefined ? body.isPublished : true,
        showinfooter: body.showInFooter !== undefined ? body.showInFooter : false,
        footerorder: body.footerOrder || 0
      }])
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
      }
      console.error('Error creating page:', error)
      return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update page
export async function PUT(request) {
  try {
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 })
    }
    
    const { data, error } = await supabaseAdmin
      .from('custom_pages')
      .update({
        title: body.title,
        content: body.content,
        slug: body.slug,
        metadescription: body.metaDescription,
        ispublished: body.isPublished,
        showinfooter: body.showInFooter,
        footerorder: body.footerOrder,
        updatedat: new Date().toISOString()
      })
      .eq('id', body.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating page:', error)
      return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete page
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('id')
    
    if (!pageId) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 })
    }
    
    const { error } = await supabaseAdmin
      .from('custom_pages')
      .delete()
      .eq('id', pageId)
    
    if (error) {
      console.error('Error deleting page:', error)
      return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
