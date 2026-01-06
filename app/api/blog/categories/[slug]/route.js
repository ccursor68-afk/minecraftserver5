import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase.js'

export async function GET(request, { params }) {
  // Handle async params in Next.js 14
  const resolvedParams = await params
  const slug = resolvedParams?.slug || resolvedParams?.slug?.[0]
  
  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
  }
  
  try {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('id, name, slug, description, icon, color')
      .eq('slug', slug)
      .single()
    
    if (error || !data) {
      console.error('Category lookup error:', error)
      return NextResponse.json({ error: 'Category not found', details: error?.message }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}