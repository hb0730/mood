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
  
  const body = await readBody(event)
  const { filter, emotion, timeRange } = body
  
  // 构建筛选条件
  let whereClause: any = {}
  
  // 状态筛选
  switch (filter) {
    case 'reported':
      whereClause.isReported = true
      break
    case 'hidden':
      whereClause.isHidden = true
      break
    case 'normal':
      whereClause.isHidden = false
      whereClause.isReported = false
      break
    case 'pending':
      whereClause.isReported = true
      whereClause.isHidden = false
      break
  }
  
  // 情绪筛选
  if (emotion !== 'all') {
    whereClause.emotion = emotion
  }
  
  // 时间范围筛选
  if (timeRange !== 'all') {
    const now = new Date()
    let startDate: Date
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(0)
    }
    
    if (timeRange !== 'all') {
      whereClause.timestamp = { gte: startDate }
    }
  }
  
  // 获取数据
  const posts = await prisma.emotionPost.findMany({
    where: whereClause,
    include: {
      comments: true
    },
    orderBy: { timestamp: 'desc' }
  })
  
  // 处理数据格式
  const exportData = posts.map(post => ({
    id: post.id,
    content: post.content,
    emotion: post.emotion,
    tags: post.tags ? JSON.parse(post.tags) : [],
    author: post.author,
    isAnonymous: post.isAnonymous,
    likes: post.likes,
    isReported: post.isReported,
    reportedBy: post.reportedBy,
    isHidden: post.isHidden,
    timestamp: post.timestamp,
    comments: post.comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      author: comment.author,
      isAnonymous: comment.isAnonymous,
      isReported: comment.isReported,
      reportedBy: comment.reportedBy,
      timestamp: comment.timestamp
    }))
  }))
  
  return {
    success: true,
    data: exportData,
    exportInfo: {
      totalRecords: exportData.length,
      filter,
      emotion,
      timeRange,
      exportDate: new Date().toISOString()
    }
  }
})
