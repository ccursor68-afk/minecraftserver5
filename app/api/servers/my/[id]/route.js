import { NextResponse } from 'next/server'
import { supabaseAdmin, createServerSupabaseClient } from '../../../../../lib/supabase.js'

// DELETE /api/servers/my/[id] - Delete user's own server
export async function DELETE(request, { params }) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const resolvedParams = await params
    const serverId = resolvedParams?.id
    
    if (!serverId) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 })
    }
    
    // Check if server belongs to user
    const { data: server, error: fetchError } = await supabaseAdmin
      .from('servers')
      .select('id, name, ownerId')
      .eq('id', serverId)
      .single()
    
    if (fetchError || !server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 })
    }
    
    if (server.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized - Not your server' }, { status: 403 })
    }
    
    // Delete server
    const { error: deleteError } = await supabaseAdmin
      .from('servers')
      .delete()
      .eq('id', serverId)
    
    if (deleteError) {
      console.error('Error deleting server:', deleteError)
      return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 })
    }
    
    // Log activity
    await supabaseAdmin
      .from('user_activity')
      .insert([{
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        activityType: 'server_delete',
        description: `${server.name} sunucusu silindi`
      }])
    
    return NextResponse.json({ success: true, message: 'Server deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
