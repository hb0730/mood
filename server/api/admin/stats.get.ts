import jwt from 'jsonwebtoken'
import { prisma } from '../../prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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
    jwt.verify(token, JWT_SECRET)
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token无效'
    })
  }
  
  // 获取统计数据
  const total = await prisma.emotionPost.count()
  const active = await prisma.emotionPost.count({
    where: { isHidden: false }
  })
  const reported = await prisma.emotionPost.count({
    where: { isReported: true }
  })
  const pendingReports = await prisma.emotionPost.count({
    where: { 
      isReported: true,
      isHidden: false 
    }
  })
  const hidden = await prisma.emotionPost.count({
    where: { isHidden: true }
  })
  
  // 时间范围统计
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000)
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const [todayCount, yesterdayCount, weekCount, monthCount, todayComments] = await Promise.all([
    prisma.emotionPost.count({
      where: { timestamp: { gte: startOfDay } }
    }),
    prisma.emotionPost.count({
      where: { 
        timestamp: { 
          gte: startOfYesterday,
          lt: startOfDay
        }
      }
    }),
    prisma.emotionPost.count({
      where: { timestamp: { gte: startOfWeek } }
    }),
    prisma.emotionPost.count({
      where: { timestamp: { gte: startOfMonth } }
    }),
    prisma.comment.count({
      where: { timestamp: { gte: startOfDay } }
    })
  ])
  
  // 情绪分布统计
  const emotionStats = await prisma.emotionPost.groupBy({
    by: ['emotion'],
    _count: {
      emotion: true
    }
  })
  
  const emotionCounts = emotionStats.reduce((acc, item) => {
    acc[item.emotion] = item._count.emotion
    return acc
  }, {} as Record<string, number>)
  
  // 计算日均发布量
  const firstPost = await prisma.emotionPost.findFirst({
    orderBy: { timestamp: 'asc' }
  })
  let dailyAverage = 0
  if (firstPost) {
    const daysSinceFirst = Math.max(1, Math.floor((now.getTime() - firstPost.timestamp.getTime()) / (24 * 60 * 60 * 1000)))
    dailyAverage = Math.round(total / daysSinceFirst)
  }
  
  return {
    total,
    active,
    reported,
    pendingReports,
    hidden,
    today: todayCount,
    todayComments,
    yesterday: yesterdayCount,
    thisWeek: weekCount,
    thisMonth: monthCount,
    dailyAverage,
    emotionStats: emotionCounts,
    storageUsed: '< 1MB' // 简单估算
  }
})
