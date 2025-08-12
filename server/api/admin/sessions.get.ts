import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 存储活跃会话（生产环境应使用Redis）
const activeSessions = new Map<string, {
  token: string
  loginTime: Date
  lastActivity: Date
  ipAddress?: string
}>()

export default defineEventHandler(async (event) => {
  // 验证管理员权限
  const authorization = getHeader(event, 'authorization')
  if (!authorization) {
    throw createError({
      statusCode: 401,
      statusMessage: '未授权访问'
    })
  }
  
  const token = authorization.replace('Bearer ', '')
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // 更新最后活动时间
    const sessionId = decoded.sessionId || 'default'
    if (activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId)!
      session.lastActivity = new Date()
    }
    
    // 返回会话信息
    const sessions = Array.from(activeSessions.values()).map(session => ({
      loginTime: session.loginTime,
      lastActivity: session.lastActivity,
      ipAddress: session.ipAddress || '未知',
      isExpired: (new Date().getTime() - session.lastActivity.getTime()) > 24 * 60 * 60 * 1000 // 24小时
    }))
    
    return {
      currentSession: activeSessions.get(decoded.sessionId || 'default'),
      allSessions: sessions,
      activeCount: sessions.filter(s => !s.isExpired).length
    }
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token无效'
    })
  }
})

// 导出会话管理函数供其他模块使用
export { activeSessions }
