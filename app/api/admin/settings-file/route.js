import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Read settings from file
function readSettings() {
  try {
    ensureDataDir()
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return getDefaultSettings()
  } catch (error) {
    console.error('Error reading settings:', error)
    return getDefaultSettings()
  }
}

// Write settings to file
function writeSettings(settings) {
  try {
    ensureDataDir()
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error writing settings:', error)
    return false
  }
}

function getDefaultSettings() {
  return {
    id: 'main',
    sitename: 'Minecraft Server List',
    sitetagline: 'En İyi Minecraft Sunucuları',
    logourl: '',
    faviconurl: '',
    primarycolor: '#22c55e',
    secondarycolor: '#eab308',
    accentcolor: '#3b82f6',
    footertext: '© 2025 Minecraft Server List',
    googleanalyticsid: '',
    googleadsclientid: '',
    analyticsenabled: false,
    adsenabled: false,
    adslots: {},
    socialmedia: {
      discord: '',
      twitter: '',
      facebook: '',
      instagram: '',
      youtube: '',
      tiktok: ''
    }
  }
}

// GET settings
export async function GET() {
  try {
    const settings = readSettings()
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json(getDefaultSettings())
  }
}

// UPDATE settings
export async function PUT(request) {
  try {
    const body = await request.json()
    const currentSettings = readSettings()
    
    const updatedSettings = {
      ...currentSettings,
      sitename: body.siteName || currentSettings.sitename,
      sitetagline: body.siteTagline || currentSettings.sitetagline,
      logourl: body.logoUrl || currentSettings.logourl,
      faviconurl: body.faviconUrl || currentSettings.faviconurl,
      primarycolor: body.primaryColor || currentSettings.primarycolor,
      secondarycolor: body.secondaryColor || currentSettings.secondarycolor,
      accentcolor: body.accentColor || currentSettings.accentcolor,
      footertext: body.footerText || currentSettings.footertext,
      googleanalyticsid: body.googleAnalyticsId || currentSettings.googleanalyticsid,
      googleadsclientid: body.googleAdsClientId || currentSettings.googleadsclientid,
      analyticsenabled: body.analyticsEnabled !== undefined ? body.analyticsEnabled : currentSettings.analyticsenabled,
      adsenabled: body.adsEnabled !== undefined ? body.adsEnabled : currentSettings.adsenabled,
      adslots: body.adSlots || currentSettings.adslots,
      socialmedia: body.socialMedia || currentSettings.socialmedia
    }
    
    const success = writeSettings(updatedSettings)
    
    if (!success) {
      return NextResponse.json({ error: 'Dosya yazılamadı' }, { status: 500 })
    }
    
    console.log('[FILE] Settings updated:', updatedSettings.primarycolor)
    
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('PUT Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
