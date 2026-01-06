import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Legacy client for database operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service role (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Browser client for auth (client components)
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Server client for API routes (server components)
export function createServerSupabaseClient() {
  const { cookies } = require('next/headers')
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Helper function to check if tables exist and have data
export const checkDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('servers')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('Database check error:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}

// Initialize mock data if database is empty
export const initializeMockData = async () => {
  try {
    // Check if servers exist
    const { data: existingServers } = await supabase
      .from('servers')
      .select('id')
      .limit(1)
    
    if (existingServers && existingServers.length > 0) {
      console.log('Database already has data')
      return
    }
    
    // Insert mock servers
    const mockServers = [
      {
        id: 'server_1',
        name: 'WildWood Survival',
        ip: 'mbs.wildwoodsmp.com',
        port: 25565,
        website: 'https://wildwoodsmp.com',
        discord: 'https://discord.gg/wildwood',
        bannerUrl: 'https://via.placeholder.com/468x60/22c55e/ffffff?text=WildWood+Survival',
        shortDescription: 'Pure vanilla survival experience with active community',
        longDescription: '# WildWood Survival\n\nWelcome to WildWood - The premier Minecraft survival server!\n\n## Features\n- Pure vanilla gameplay\n- Active community\n- Regular events\n- No pay-to-win',
        version: '1.21',
        category: 'Survival',
        status: 'online',
        onlinePlayers: 5289,
        maxPlayers: 10000,
        voteCount: 15420,
        votifierIp: 'mbs.wildwoodsmp.com',
        votifierPort: 8192,
        votifierPublicKey: 'mock_public_key_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'server_2',
        name: 'BlossomCraft Network',
        ip: 'mbs.blossomcraft.org',
        port: 25565,
        website: 'https://blossomcraft.org',
        discord: 'https://discord.gg/blossomcraft',
        bannerUrl: 'https://via.placeholder.com/468x60/f97316/ffffff?text=BlossomCraft',
        shortDescription: 'Java & Bedrock crossplay with multiple game modes',
        longDescription: '# BlossomCraft Network\n\nJoin the most diverse Minecraft network!\n\n## Game Modes\n- Survival\n- PvE\n- Vanilla\n- Economy',
        version: '1.21',
        category: 'Network',
        status: 'online',
        onlinePlayers: 476,
        maxPlayers: 2000,
        voteCount: 12850,
        votifierIp: 'mbs.blossomcraft.org',
        votifierPort: 8192,
        votifierPublicKey: 'mock_public_key_2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'server_3',
        name: 'MellowCraft',
        ip: 'msl.mellowcraft.org',
        port: 25565,
        website: 'https://mellowcraft.org',
        discord: 'https://discord.gg/mellowcraft',
        bannerUrl: 'https://via.placeholder.com/468x60/eab308/000000?text=MellowCraft',
        shortDescription: 'Relaxing survival server with friendly community',
        longDescription: '# MellowCraft\n\nRelax and enjoy Minecraft the way it was meant to be played.\n\n## Why Choose Us?\n- Friendly staff\n- No griefing\n- Regular backups\n- Custom plugins',
        version: '1.20.1',
        category: 'Survival',
        status: 'online',
        onlinePlayers: 187,
        maxPlayers: 500,
        voteCount: 9340,
        votifierIp: 'msl.mellowcraft.org',
        votifierPort: 8192,
        votifierPublicKey: 'mock_public_key_3',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'server_4',
        name: 'MysticMC',
        ip: 'mbs.mysticmc.co',
        port: 25565,
        website: 'https://mysticmc.co',
        discord: 'https://discord.gg/mysticmc',
        bannerUrl: 'https://via.placeholder.com/468x60/3b82f6/ffffff?text=MysticMC',
        shortDescription: 'Custom multiplayer experience with unique features',
        longDescription: '# MysticMC\n\nExperience Minecraft like never before!\n\n## Features\n- Custom items\n- Towny\n- Economy\n- Player economy',
        version: '1.21',
        category: 'Survival',
        status: 'online',
        onlinePlayers: 356,
        maxPlayers: 1000,
        voteCount: 7890,
        votifierIp: 'mbs.mysticmc.co',
        votifierPort: 8192,
        votifierPublicKey: 'mock_public_key_4',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'server_5',
        name: 'Simple Survival',
        ip: 'mbs.simplesurvival.gg',
        port: 25565,
        website: 'https://simplesurvival.gg',
        discord: 'https://discord.gg/simplesurvival',
        bannerUrl: 'https://via.placeholder.com/468x60/8b5cf6/ffffff?text=Simple+Survival',
        shortDescription: 'Back to basics survival with Java & Bedrock support',
        longDescription: '# Simple Survival\n\nPure survival, no complications.\n\n## What We Offer\n- Vanilla gameplay\n- Cross-platform\n- Active admins\n- Community events',
        version: '1.21',
        category: 'Survival',
        status: 'online',
        onlinePlayers: 141,
        maxPlayers: 300,
        voteCount: 6120,
        votifierIp: 'mbs.simplesurvival.gg',
        votifierPort: 8192,
        votifierPublicKey: 'mock_public_key_5',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'server_6',
        name: 'Survivify',
        ip: 'mbs.survivify.org',
        port: 25565,
        website: 'https://survivify.org',
        discord: 'https://discord.gg/survivify',
        bannerUrl: 'https://via.placeholder.com/468x60/ec4899/ffffff?text=Survivify',
        shortDescription: 'Weekly events and active community survival server',
        longDescription: '# Survivify\n\nJoin our weekly events and win amazing prizes!\n\n## Events\n- Building contests\n- PvP tournaments\n- Treasure hunts\n- And more!',
        version: '1.20.1',
        category: 'Survival',
        status: 'online',
        onlinePlayers: 45,
        maxPlayers: 200,
        voteCount: 4560,
        votifierIp: 'mbs.survivify.org',
        votifierPort: 8192,
        votifierPublicKey: 'mock_public_key_6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    const { error } = await supabase
      .from('servers')
      .insert(mockServers)
    
    if (error) {
      console.error('Error inserting mock data:', error)
    } else {
      console.log('Mock data inserted successfully')
    }
  } catch (error) {
    console.error('Error initializing mock data:', error)
  }
}