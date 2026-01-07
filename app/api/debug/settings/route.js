import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.js'

export async function GET() {
  try {
    // Get ALL rows, not just single
    const { data: allSettings, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
    
    return NextResponse.json({
      count: allSettings?.length || 0,
      rows: allSettings || [],
      error: error?.message || null
    })
  } catch (error) {
    return NextResponse.json({ error: error.message })
  }
}
