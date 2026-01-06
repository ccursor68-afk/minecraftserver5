import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase.js'

// Public endpoint - only published pages
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const footer = searchParams.get('footer')
  
  try {
    let query = supabaseAdmin
      .from('custom_pages')
      .select('id, slug, title, metaDescription, showInFooter, footerOrder')
      .eq('isPublished', true)
    
    if (footer === 'true') {
      query = query.eq('showInFooter', true)
    }
    
    query = query.order('footerOrder', { ascending: true })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching pages:', error)
      return NextResponse.json([])
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json([])
  }
}
