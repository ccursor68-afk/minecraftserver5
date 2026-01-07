import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.js'

// Public endpoint to get all public settings
export async function GET() {
  try {
    console.log('[PUBLIC API] Fetching settings from Supabase...')
    
    const { data: settings, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .single()
    
    console.log('[PUBLIC API] Settings:', settings)
    console.log('[PUBLIC API] Error:', error)
    
    if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
      console.error('Error fetching settings:', error)
      return NextResponse.json(getDefaultSettings())
    }
    
    if (!settings) {
      console.log('[PUBLIC API] No settings found, returning defaults')
      return NextResponse.json(getDefaultSettings())
    }
    
    console.log('[PUBLIC API] Returning settings')
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(getDefaultSettings())
  }
}

function getDefaultSettings() {
  return {
    analyticsEnabled: false,
    adsEnabled: false,
    googleAnalyticsId: '',
    googleAdsClientId: '',
    adSlots: {},
    siteName: 'Minecraft Server List',
    siteTagline: 'En İyi Minecraft Sunucuları',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#22c55e',
    secondaryColor: '#eab308',
    accentColor: '#3b82f6',
    footerText: '© 2025 Minecraft Server List. Tüm hakları saklıdır.',
    socialMedia: {
      discord: '',
      twitter: '',
      facebook: '',
      instagram: '',
      youtube: '',
      tiktok: ''
    }
  }
}
