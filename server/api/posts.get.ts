import { prisma } from '../prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  // 分页参数
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20 // 默认每页20条
  const skip = (page - 1) * limit
  
  // 情绪筛选和用户ID
  const emotion = query.emotion as string
  const userId = query.userId as string
  
  // 构建查询条件 - 排除被隐藏的帖子
  const whereClause: any = { isHidden: false }
  if (emotion) {
    whereClause.emotion = emotion
  }
  
  const posts = await prisma.emotionPost.findMany({
    where: whereClause,
    orderBy: { timestamp: 'desc' },
    include: { 
      comments: true,
      likedBy: true // 包含点赞信息
    },
    skip,
    take: limit,
  })
  
  // 获取总数用于分页信息
  const total = await prisma.emotionPost.count({
    where: whereClause
  })
  
  // 确保时间戳格式正确，并安全地解析tags JSON字符串
  const processedPosts = posts.map(post => {
    let parsedTags: string[] = []
    
    // 安全地解析tags
    if (post.tags && typeof post.tags === 'string') {
      try {
        const parsed = JSON.parse(post.tags)
        parsedTags = Array.isArray(parsed) ? parsed : []
      } catch (error) {
        console.warn('Failed to parse tags for post', post.id, error)
        parsedTags = []
      }
    }
    
    // 检查当前用户是否已点赞
    const liked = userId ? post.likedBy.some(like => like.userId === userId) : false
    
    return {
      ...post,
      timestamp: new Date(post.timestamp),
      tags: parsedTags,
      liked,
      comments: post.comments.map(comment => ({
        ...comment,
        timestamp: new Date(comment.timestamp)
      })),
      // 移除敏感的点赞详情，只保留点赞状态
      likedBy: undefined
    }
  })
  
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


