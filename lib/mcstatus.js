// mcstatus.io API integration for checking Minecraft server status

export const getServerStatus = async (ip, port = 25565) => {
  try {
    const response = await fetch(`https://api.mcstatus.io/v2/status/java/${ip}:${port}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch server status')
    }
    
    const data = await response.json()
    
    return {
      online: data.online || false,
      players: {
        online: data.players?.online || 0,
        max: data.players?.max || 0
      },
      version: data.version?.name_clean || 'Unknown',
      motd: data.motd?.clean || '',
      icon: data.icon || null
    }
  } catch (error) {
    console.error('mcstatus.io error:', error)
    return {
      online: false,
      players: { online: 0, max: 0 },
      version: 'Unknown',
      motd: '',
      icon: null
    }
  }
}

// Batch update server statuses
export const updateServerStatuses = async (servers) => {
  const updates = await Promise.all(
    servers.map(async (server) => {
      const status = await getServerStatus(server.ip, server.port)
      return {
        id: server.id,
        status: status.online ? 'online' : 'offline',
        onlinePlayers: status.players.online,
        maxPlayers: status.players.max
      }
    })
  )
  
  return updates
}