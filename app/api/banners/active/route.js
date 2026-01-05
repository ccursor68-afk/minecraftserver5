import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase.js'

export async function GET() {
  try {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('isActive', true)
      .or(`startDate.is.null,startDate.lte.${now}`)
      .or(`endDate.is.null,endDate.gte.${now}`)
      .order('position', { ascending: true })
    
    if (error) {
      console.error('Error fetching banners:', error)
      return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}