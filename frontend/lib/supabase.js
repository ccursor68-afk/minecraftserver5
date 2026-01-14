import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/* ------------------------------------------------------------------ */
/* SAFETY CHECK                                                       */
/* ------------------------------------------------------------------ */

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase env variables missing. Check .env.local')
}

/* ------------------------------------------------------------------ */
/* PUBLIC CLIENT (SAFE FOR CLIENT + SERVER)                            */
/* ------------------------------------------------------------------ */

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

/* ------------------------------------------------------------------ */
/* ADMIN CLIENT (SERVER ONLY)                                          */
/* ⚠️ API ROUTES / SERVER ACTIONS ONLY                                 */
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
  } catch (err) {
    console.error('Database connection error:', err)
    return false
  }
}

/* ------------------------------------------------------------------ */
/* MOCK DATA (DEV ONLY)                                                */
/* ------------------------------------------------------------------ */

export const initializeMockData = async () => {
  if (!supabase) return

  try {
    const { data } = await supabase
      .from('servers')
      .select('id')
      .limit(1)

    if (data && data.length > 0) return

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

    if (error) console.error('Mock insert error:', error)
  } catch (err) {
    console.error('Mock init error:', err)
  }
}
