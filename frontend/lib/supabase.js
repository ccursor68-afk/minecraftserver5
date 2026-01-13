import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/* ------------------------------------------------------------------ */
/* SAFETY CHECK (BUILD KIRMAZ)                                         */
/* ------------------------------------------------------------------ */

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase env variables missing. Check .env.local file.'
  )
}

/* ------------------------------------------------------------------ */
/* PUBLIC / LEGACY CLIENT (SAFE)                                       */
/* ------------------------------------------------------------------ */

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/* ------------------------------------------------------------------ */
/* ADMIN CLIENT (SERVER ONLY)                                          */
/* ------------------------------------------------------------------ */

export const supabaseAdmin =
  supabaseUrl && (supabaseServiceKey || supabaseAnonKey)
    ? createClient(
        supabaseUrl,
        supabaseServiceKey || supabaseAnonKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
    : null

/* ------------------------------------------------------------------ */
/* BROWSER CLIENT (CLIENT COMPONENTS)                                  */
/* ------------------------------------------------------------------ */

export function createBrowserSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}

/* ------------------------------------------------------------------ */
/* SERVER CLIENT (API / SERVER COMPONENTS)                             */
/* ------------------------------------------------------------------ */

export function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null

  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

/* ------------------------------------------------------------------ */
/* DATABASE CHECK                                                      */
/* ------------------------------------------------------------------ */

export const checkDatabase = async () => {
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('servers')
      .select('id')
      .limit(1)

    return !error
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}

/* ------------------------------------------------------------------ */
/* MOCK DATA INITIALIZER (DEV ONLY)                                    */
/* ------------------------------------------------------------------ */

export const initializeMockData = async () => {
  if (!supabase) return

  try {
    const { data: existing } = await supabase
      .from('servers')
      .select('id')
      .limit(1)

    if (existing && existing.length > 0) return

    const mockServers = [
      {
        id: 'server_1',
        name: 'WildWood Survival',
        ip: 'mbs.wildwoodsmp.com',
        port: 25565,
        version: '1.21',
        category: 'Survival',
        status: 'online',
        onlinePlayers: 5289,
        maxPlayers: 10000,
        voteCount: 15420,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    const { error } = await supabase
      .from('servers')
      .insert(mockServers)

    if (error) {
      console.error('Mock insert error:', error)
    }
  } catch (error) {
    console.error('Mock init error:', error)
  }
}
