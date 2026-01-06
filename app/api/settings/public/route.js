import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.js'

// Public endpoint to get analytics and ads settings
export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('site_settings')
      .select('googleAnalyticsId, googleAdsClientId, adsEnabled, analyticsEnabled, adSlots')
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ 
        analyticsEnabled: false,
        adsEnabled: false,
        googleAnalyticsId: '',
        googleAdsClientId: '',
        adSlots: {}
      })
    }
    
    if (!settings) {
      return NextResponse.json({
        analyticsEnabled: false,
        adsEnabled: false,
        googleAnalyticsId: '',
        googleAdsClientId: '',
        adSlots: {}
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      analyticsEnabled: false,
      adsEnabled: false,
      googleAnalyticsId: '',
      googleAdsClientId: '',
      adSlots: {}
    })
  }
}
