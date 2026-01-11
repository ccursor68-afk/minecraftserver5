import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase.js'

// GET /api/admin/stats - Get dashboard statistics
export async function GET() {
  try {
    // Fetch servers count
    const { count: serversCount, error: serversError } = await supabaseAdmin
      .from('servers')
      .select('*', { count: 'exact', head: true })
    
    if (serversError) {
      console.error('Error fetching servers count:', serversError)
    }
    
    // Fetch users count from auth.users via users table or directly
    let usersCount = 0
    try {
      const { count, error: usersError } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      if (!usersError) {
        usersCount = count || 0
      } else {
        console.error('Error fetching users count from users:', usersError)
        // Fallback: try profiles table
        const { count: profilesCount, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        if (!profilesError) {
          usersCount = profilesCount || 0
        } else {
          // Last fallback: try to get from auth.users
          const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
          if (!authError && authUsers) {
            usersCount = authUsers.users?.length || 0
          }
        }
      }
    } catch (e) {
      console.error('Error fetching users:', e)
    }
    
    // Fetch tickets count
    let ticketsCount = 0
    try {
      const { count, error: ticketsError } = await supabaseAdmin
        .from('tickets')
        .select('*', { count: 'exact', head: true })
      
      if (!ticketsError) {
        ticketsCount = count || 0
      } else {
        console.error('Error fetching tickets count:', ticketsError)
      }
    } catch (e) {
      console.error('Error fetching tickets:', e)
    }
    
    // Fetch blog posts count
    let postsCount = 0
    try {
      const { count, error: postsError } = await supabaseAdmin
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
      
      if (!postsError) {
        postsCount = count || 0
      } else {
        console.error('Error fetching posts count:', postsError)
      }
    } catch (e) {
      console.error('Error fetching posts:', e)
    }
    
    return NextResponse.json({
      servers: serversCount || 0,
      users: usersCount,
      tickets: ticketsCount,
      posts: postsCount
    })
  } catch (error) {
    console.error('Admin stats API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      servers: 0,
      users: 0,
      tickets: 0,
      posts: 0
    }, { status: 500 })
  }
}
