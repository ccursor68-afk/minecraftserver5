import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin, initializeMockData } from '../../../lib/supabase.js'
import { sendVotifierPacket, isVotifierConfigured } from '../../../lib/votifier.js'
import { getServerStatus } from '../../../lib/mcstatus.js'

// Helper to get client IP
function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '127.0.0.1'
  return ip
}

// GET /api/servers - Get all servers sorted by votes
export async function GET(request) {
  const { pathname } = new URL(request.url)
  
  // GET /api/auth/user/:id - Get user by ID
  const userIdMatch = pathname.match(/^\/api\/auth\/user\/([^\/]+)$/)
  if (userIdMatch) {
    const userId = userIdMatch[1]
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, isActive')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      return NextResponse.json(data)
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  
  // GET /api/servers
  if (pathname === '/api/servers') {
    try {
      await initializeMockData()
      
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .order('voteCount', { ascending: false })
      
      if (error) {
        console.error('Error fetching servers:', error)
        return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
      }
      
      return NextResponse.json(data || [])
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  
  // GET /api/servers/:id
  const serverIdMatch = pathname.match(/^\/api\/servers\/([^\/]+)$/)
  if (serverIdMatch) {
    const serverId = serverIdMatch[1]
    
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .eq('id', serverId)
        .single()
      
      if (error) {
        console.error('Error fetching server:', error)
        return NextResponse.json({ error: 'Server not found' }, { status: 404 })
      }
      
      return NextResponse.json(data)
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  
  // GET /api/servers/:id/status
  const statusMatch = pathname.match(/^\/api\/servers\/([^\/]+)\/status$/)
  if (statusMatch) {
    const serverId = statusMatch[1]
    
    try {
      // Get server from database
      const { data: server, error } = await supabase
        .from('servers')
        .select('ip, port')
        .eq('id', serverId)
        .single()
      
      if (error) {
        return NextResponse.json({ error: 'Server not found' }, { status: 404 })
      }
      
      // Get live status from mcstatus.io
      const status = await getServerStatus(server.ip, server.port)
      
      // Update database with latest status
      await supabase
        .from('servers')
        .update({
          status: status.online ? 'online' : 'offline',
          onlinePlayers: status.players.online,
          maxPlayers: status.players.max,
          updatedAt: new Date().toISOString()
        })
        .eq('id', serverId)
      
      return NextResponse.json(status)
    } catch (error) {
      console.error('Status check error:', error)
      return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
    }
  }
  
  // GET /api/servers/:id/can-vote
  const canVoteMatch = pathname.match(/^\/api\/servers\/([^\/]+)\/can-vote$/)
  if (canVoteMatch) {
    const serverId = canVoteMatch[1]
    const clientIp = getClientIp(request)
    
    try {
      // Check if user voted in last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const { data: recentVotes, error } = await supabase
        .from('votes')
        .select('votedAt')
        .eq('serverId', serverId)
        .eq('voterIp', clientIp)
        .gte('votedAt', twentyFourHoursAgo)
        .order('votedAt', { ascending: false })
        .limit(1)
      
      if (error) {
        console.error('Error checking vote status:', error)
        return NextResponse.json({ error: 'Failed to check vote status' }, { status: 500 })
      }
      
      const canVote = !recentVotes || recentVotes.length === 0
      let timeUntilNextVote = 0
      
      if (!canVote && recentVotes.length > 0) {
        const lastVote = new Date(recentVotes[0].votedAt)
        const nextVoteTime = new Date(lastVote.getTime() + 24 * 60 * 60 * 1000)
        timeUntilNextVote = Math.max(0, nextVoteTime.getTime() - Date.now())
      }
      
      return NextResponse.json({
        canVote,
        timeUntilNextVote,
        lastVote: recentVotes && recentVotes.length > 0 ? recentVotes[0].votedAt : null
      })
    } catch (error) {
      console.error('Can vote check error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  
  // GET /api/tickets - Get user tickets
  if (pathname === '/api/tickets') {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
      
      if (error) {
        console.error('Error fetching tickets:', error)
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
      }
      
      return NextResponse.json(data || [])
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  
  // GET /api/tickets/:id - Get ticket by ID
  const ticketIdMatch = pathname.match(/^\/api\/tickets\/([^\/]+)$/)
  if (ticketIdMatch) {
    const ticketId = ticketIdMatch[1]
    
    try {
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single()
      
      if (ticketError) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
      }
      
      // Get ticket replies
      const { data: replies, error: repliesError } = await supabase
        .from('ticket_replies')
        .select('*')
        .eq('ticketId', ticketId)
        .order('createdAt', { ascending: true })
      
      return NextResponse.json({
        ...ticket,
        replies: replies || []
      })
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

// POST /api/servers - Create new server
// POST /api/servers/:id/vote - Vote for server
// POST /api/auth/create-user - Create user in database
export async function POST(request) {
  const { pathname } = new URL(request.url)
  
  // POST /api/auth/create-user - Create user record
  if (pathname === '/api/auth/create-user') {
    try {
      const body = await request.json()
      
      if (!body.id || !body.email) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', body.id)
        .single()
      
      if (existingUser) {
        return NextResponse.json({ message: 'User already exists' })
      }
      
      // Create user
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: body.id,
          email: body.email,
          role: 'user',
          isActive: true,
          createdAt: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
      
      return NextResponse.json(data, { status: 201 })
    } catch (error) {
      console.error('Create user error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  
  // POST /api/servers - Create new server
  if (pathname === '/api/servers') {
    try {
      const body = await request.json()
      
      // Validate required fields
      if (!body.name || !body.ip || !body.bannerUrl || !body.shortDescription || !body.longDescription) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      
      // Generate server ID
      const serverId = `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Create server object
      const serverData = {
        id: serverId,
        name: body.name,
        ip: body.ip,
        port: body.port || 25565,
        website: body.website || null,
        discord: body.discord || null,
        bannerUrl: body.bannerUrl,
        shortDescription: body.shortDescription,
        longDescription: body.longDescription,
        version: body.version || '1.21',
        category: body.category || 'Survival',
        status: 'offline',
        onlinePlayers: 0,
        maxPlayers: 0,
        voteCount: 0,
        ownerId: body.ownerId || null,
        votifierIp: body.votifierIp || null,
        votifierPort: body.votifierPort || null,
        votifierPublicKey: body.votifierPublicKey || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Check server status immediately
      try {
        const status = await getServerStatus(serverData.ip, serverData.port)
        if (status.online) {
          serverData.status = 'online'
          serverData.onlinePlayers = status.players.online
          serverData.maxPlayers = status.players.max
        }
      } catch (error) {
        console.error('Error checking initial server status:', error)
      }
      
      // Insert into database
      const { data, error } = await supabase
        .from('servers')
        .insert([serverData])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating server:', error)
        return NextResponse.json({ error: 'Failed to create server' }, { status: 500 })
      }
      
      return NextResponse.json(data, { status: 201 })
    } catch (error) {
      console.error('Server creation error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  
  // POST /api/tickets - Create new ticket
  if (pathname === '/api/tickets') {
    try {
      const body = await request.json()
      
      console.log('Creating ticket with data:', body)
      
      if (!body.userId || !body.subject || !body.message) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      
      const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const ticketData = {
        id: ticketId,
        userId: body.userId,
        serverId: body.serverId || null,
        subject: body.subject,
        message: body.message,
        category: body.category || 'general',
        status: 'open',
        priority: body.priority || 'normal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      console.log('Inserting ticket:', ticketData)
      
      const { data, error } = await supabase
        .from('tickets')
        .insert([ticketData])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating ticket:', error)
        return NextResponse.json({ 
          error: 'Failed to create ticket',
          details: error.message 
        }, { status: 500 })
      }
      
      console.log('Ticket created successfully:', data)
      return NextResponse.json(data, { status: 201 })
    } catch (error) {
      console.error('Ticket creation error:', error)
      return NextResponse.json({ 
        error: 'Internal server error',
        details: error.message 
      }, { status: 500 })
    }
  }
  
  // POST /api/tickets/:id/reply - Add reply to ticket
  const ticketReplyMatch = pathname.match(/^\/api\/tickets\/([^\/]+)\/reply$/)
  if (ticketReplyMatch) {
    const ticketId = ticketReplyMatch[1]
    
    try {
      const body = await request.json()
      
      if (!body.userId || !body.message) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }
      
      const replyId = `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const { data, error } = await supabase
        .from('ticket_replies')
        .insert([{
          id: replyId,
          ticketId,
          userId: body.userId,
          message: body.message,
          isAdmin: body.isAdmin || false,
          createdAt: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating reply:', error)
        return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
      }
      
      // Update ticket's updatedAt
      await supabase
        .from('tickets')
        .update({ updatedAt: new Date().toISOString() })
        .eq('id', ticketId)
      
      return NextResponse.json(data, { status: 201 })
    } catch (error) {
      console.error('Reply creation error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  
  const voteMatch = pathname.match(/^\/api\/servers\/([^\/]+)\/vote$/)
  if (voteMatch) {
    const serverId = voteMatch[1]
    const clientIp = getClientIp(request)
    
    try {
      // Get request body
      const body = await request.json()
      const { username = 'Anonymous', recaptchaToken } = body
      
      // TODO: Verify reCAPTCHA token when user adds it
      // if (recaptchaToken) {
      //   const isValid = await verifyRecaptcha(recaptchaToken)
      //   if (!isValid) {
      //     return NextResponse.json({ error: 'Invalid captcha' }, { status: 400 })
      //   }
      // }
      
      // Check if user can vote (24 hour cooldown)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const { data: recentVotes, error: voteCheckError } = await supabase
        .from('votes')
        .select('votedAt')
        .eq('serverId', serverId)
        .eq('voterIp', clientIp)
        .gte('votedAt', twentyFourHoursAgo)
      
      if (voteCheckError) {
        console.error('Vote check error:', voteCheckError)
        return NextResponse.json({ error: 'Failed to check vote eligibility' }, { status: 500 })
      }
      
      if (recentVotes && recentVotes.length > 0) {
        const lastVote = new Date(recentVotes[0].votedAt)
        const nextVoteTime = new Date(lastVote.getTime() + 24 * 60 * 60 * 1000)
        const hoursLeft = Math.ceil((nextVoteTime.getTime() - Date.now()) / (1000 * 60 * 60))
        
        return NextResponse.json(
          { 
            error: 'You can only vote once every 24 hours',
            cooldown: true,
            hoursLeft,
            nextVoteTime: nextVoteTime.toISOString()
          },
          { status: 429 }
        )
      }
      
      // Get server details
      const { data: server, error: serverError } = await supabase
        .from('servers')
        .select('*')
        .eq('id', serverId)
        .single()
      
      if (serverError || !server) {
        return NextResponse.json({ error: 'Server not found' }, { status: 404 })
      }
      
      // Insert vote record
      const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const { error: insertError } = await supabase
        .from('votes')
        .insert([{
          id: voteId,
          serverId,
          voterIp: clientIp,
          votedAt: new Date().toISOString()
        }])
      
      if (insertError) {
        console.error('Vote insert error:', insertError)
        return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 })
      }
      
      // Update server vote count
      const { error: updateError } = await supabase
        .from('servers')
        .update({ 
          voteCount: server.voteCount + 1,
          updatedAt: new Date().toISOString()
        })
        .eq('id', serverId)
      
      if (updateError) {
        console.error('Vote count update error:', updateError)
        return NextResponse.json({ error: 'Failed to update vote count' }, { status: 500 })
      }
      
      // Send Votifier packet if configured
      let votifierResult = null
      if (isVotifierConfigured(server)) {
        votifierResult = await sendVotifierPacket(server, username)
      }
      
      return NextResponse.json({
        success: true,
        message: 'Vote recorded successfully!',
        voteCount: server.voteCount + 1,
        votifier: votifierResult,
        nextVoteTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    } catch (error) {
      console.error('Vote error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}