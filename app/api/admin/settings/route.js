import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.js'

// Get all settings
export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
      console.error('Error fetching settings:', error)
      return NextResponse.json(getDefaultSettings(), { status: 200 })
    }
    
    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json(getDefaultSettings())
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(getDefaultSettings())
  }
}

function getDefaultSettings() {
  return {
    id: 'main',
    googleAnalyticsId: '',
    googleAdsClientId: '',
    adsEnabled: false,
    analyticsEnabled: false,
    adSlots: {
      blogTopBanner: '',
      blogSidebar: '',
      blogInContent: '',
      homeTopBanner: '',
      homeSidebar: ''
    },
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

// Update settings
export async function PUT(request) {
  try {
    const body = await request.json()
    
    // Check if table exists by trying to select
    const { data: existing, error: selectError } = await supabaseAdmin
      .from('site_settings')
      .select('id')
      .single()
    
    let result
    
    // If table doesn't exist, return error with message
    if (selectError && selectError.code === 'PGRST205') {
      return NextResponse.json({ 
        error: 'Tablo bulunamadı. Lütfen Supabase SQL scriptlerini çalıştırın.',
        details: 'site_settings tablosu mevcut değil. SETUP.md dosyasındaki SQL scriptlerini çalıştırın.'
      }, { status: 400 })
    }
    
    if (existing) {
      // Update existing settings
      const { data, error } = await supabaseAdmin
        .from('site_settings')
        .update({
          googleAnalyticsId: body.googleAnalyticsId || '',
          googleAdsClientId: body.googleAdsClientId || '',
          adsEnabled: body.adsEnabled || false,
          analyticsEnabled: body.analyticsEnabled || false,
          adSlots: body.adSlots || {},
          siteName: body.siteName || 'Minecraft Server List',
          siteTagline: body.siteTagline || '',
          logoUrl: body.logoUrl || '',
          faviconUrl: body.faviconUrl || '',
          primaryColor: body.primaryColor || '#22c55e',
          secondaryColor: body.secondaryColor || '#eab308',
          accentColor: body.accentColor || '#3b82f6',
          footerText: body.footerText || '',
          socialMedia: body.socialMedia || {},
          updatedAt: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating settings:', error)
        return NextResponse.json({ error: 'Ayarlar güncellenemedi: ' + error.message }, { status: 500 })
      }
      result = data
    } else {
      // Create new settings
      const { data, error } = await supabaseAdmin
        .from('site_settings')
        .insert([{
          id: 'main',
          googleAnalyticsId: body.googleAnalyticsId || '',
          googleAdsClientId: body.googleAdsClientId || '',
          adsEnabled: body.adsEnabled || false,
          analyticsEnabled: body.analyticsEnabled || false,
          adSlots: body.adSlots || {},
          siteName: body.siteName || 'Minecraft Server List',
          siteTagline: body.siteTagline || '',
          logoUrl: body.logoUrl || '',
          faviconUrl: body.faviconUrl || '',
          primaryColor: body.primaryColor || '#22c55e',
          secondaryColor: body.secondaryColor || '#eab308',
          accentColor: body.accentColor || '#3b82f6',
          footerText: body.footerText || '',
          socialMedia: body.socialMedia || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating settings:', error)
        return NextResponse.json({ error: 'Ayarlar oluşturulamadı: ' + error.message }, { status: 500 })
      }
      result = data
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası: ' + error.message }, { status: 500 })
  }
}
