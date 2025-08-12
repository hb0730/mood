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
  
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const filter = query.filter as string || 'all'
  const emotion = query.emotion as string || 'all'
  const timeRange = query.timeRange as string || 'all'
  const sort = query.sort as string || 'newest'
  const skip = (page - 1) * limit
  
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
        startDate = new Date(0) // 默认不限制
    }
    
    if (timeRange !== 'all') {
      whereClause.timestamp = { gte: startDate }
    }
  }
  
  // 构建排序条件
  let orderBy: any = { timestamp: 'desc' }
  switch (sort) {
    case 'oldest':
      orderBy = { timestamp: 'asc' }
      break
    case 'most_reported':
      // 优先显示被举报的，然后按时间排序
      orderBy = [{ isReported: 'desc' }, { timestamp: 'desc' }]
      break
    case 'most_liked':
      orderBy = { likes: 'desc' }
      break
    case 'most_comments':
      // SQLite不直接支持关联计数排序，用创建时间代替
      orderBy = { timestamp: 'desc' }
      break
  }
  
  const posts = await prisma.emotionPost.findMany({
    where: whereClause,
    orderBy,
    skip,
    take: limit,
    include: {
      comments: true
    }
  })
  
  const total = await prisma.emotionPost.count({
    where: whereClause
  })
  
  // 处理数据格式
  const processedPosts = posts.map(post => ({
    ...post,
    tags: post.tags ? JSON.parse(post.tags) : [],
    timestamp: new Date(post.timestamp),
    comments: post.comments.map(comment => ({
      ...comment,
      timestamp: new Date(comment.timestamp)
    }))
  }))
  
  return {
    posts: processedPosts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  }
})
