import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabase.js'

export async function GET(request, { params }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  
  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }
  
  try {
    const { data, error } = await supabaseAdmin
      .from('custom_pages')
      .select('*')
      .eq('slug', slug)
      .eq('isPublished', true)
      .single()
    
    if (error || !data) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
