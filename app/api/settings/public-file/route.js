import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json')

function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading settings:', error)
  }
  
  return {
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

export async function GET() {
  try {
    const settings = readSettings()
    
    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('Public API Error:', error)
    return NextResponse.json(readSettings())
  }
}
