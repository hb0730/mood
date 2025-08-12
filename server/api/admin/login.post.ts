import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { activeSessions } from './sessions.get'

const schema = z.object({
  password: z.string().min(1)
})

// 简单的管理员密码 - 实际使用时应该从环境变量读取
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { password } = schema.parse(body)
  
  if (password !== ADMIN_PASSWORD) {
    throw createError({
      statusCode: 401,
      statusMessage: '密码错误'
    })
  }
  
  // 获取客户端IP
  const clientIP = getHeader(event, 'x-forwarded-for') || 
                   getHeader(event, 'x-real-ip') || 
                   '127.0.0.1'
  
  // 生成会话ID
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // 生成JWT token
  const token = jwt.sign(
    { 
      role: 'admin', 
      sessionId,
      timestamp: Date.now() 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
  
  // 存储会话信息
  activeSessions.set(sessionId, {
    token,
    loginTime: new Date(),
    lastActivity: new Date(),
    ipAddress: clientIP
  })
  
  return {
    success: true,
    token,
    sessionId,
    message: '登录成功',
    loginInfo: {
      time: new Date().toISOString(),
      ip: clientIP
    }
  }
})
