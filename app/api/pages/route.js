import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase.js'

// Public endpoint - only published pages
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const footer = searchParams.get('footer')
  
  try {
    let query = supabaseAdmin
      .from('custom_pages')
      .select('id, slug, title, metadescription, showinfooter, footerorder')
      .eq('isPublished', true)
    
    if (footer === 'true') {
      query = query.eq('showinfooter', true)
    }
    
    query = query.order('footerorder', { ascending: true })
    
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
