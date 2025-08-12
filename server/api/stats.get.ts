import { prisma } from '../prisma'

export default defineEventHandler(async () => {
  try {
    // 获取所有帖子
    const allPosts = await prisma.emotionPost.findMany({
      include: {
        comments: true
      }
    })

    // 计算总数
    const total = allPosts.length

    // 按情绪类型统计
    const byType: Record<string, number> = {
      happy: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      excited: 0,
      frustrated: 0,
      grateful: 0,
      neutral: 0
    }

    // 时间相关统计
    const now = new Date()
    // 使用UTC时间来避免时区问题
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

    let todayCount = 0
    let weekCount = 0
    let monthCount = 0
    let recentActivity = 0

    // 标签统计
    const tagStats: { [key: string]: number } = {}

    // 遍历所有帖子进行统计
    allPosts.forEach(post => {
      // 情绪类型统计
      if (post.emotion && byType.hasOwnProperty(post.emotion)) {
        byType[post.emotion] = (byType[post.emotion] || 0) + 1
      }

      const postDate = new Date(post.timestamp)
      
      // 今日帖子
      if (postDate >= today) {
        todayCount++
      }

      // 本周帖子
      if (postDate >= thisWeek) {
        weekCount++
      }

      // 本月帖子
      if (postDate >= thisMonth) {
        monthCount++
      }

      // 24小时内活跃（recent activity）
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      if (postDate >= yesterday) {
        recentActivity++
      }

      // 标签统计
      if (post.tags && typeof post.tags === 'string') {
        try {
          const tags = JSON.parse(post.tags)
          if (Array.isArray(tags)) {
            tags.forEach(tag => {
              if (typeof tag === 'string') {
                tagStats[tag] = (tagStats[tag] || 0) + 1
              }
            })
          }
        } catch (error) {
          // 忽略JSON解析错误
        }
      }
    })

    // 获取热门标签（前10个）
    const topTags = Object.entries(tagStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // 计算活跃用户数（基于匿名和非匿名帖子）
    // 计算真实的唯一用户数
    const userIds = new Set()
    allPosts.forEach(post => {
      if (post.userId) {
        userIds.add(post.userId)
      } else if (post.author) {
        userIds.add(post.author)
      } else {
        // 对于没有userId的旧数据，按内容hash估算
        userIds.add('legacy_' + post.content.substring(0, 10))
      }
    })
    const uniqueUsers = userIds.size // 估算

    // 总评论数
    const totalComments = allPosts.reduce((sum, post) => sum + post.comments.length, 0)

    return {
      total,
      byType,
      recentActivity,
      topTags,
      timeStats: {
        today: todayCount,
        week: weekCount,
        month: monthCount
      },
      uniqueUsers,
      totalComments,
      avgCommentsPerPost: total > 0 ? Math.round((totalComments / total) * 10) / 10 : 0
    }
  } catch (error) {
    console.error('统计数据获取失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '统计数据获取失败'
    })
  }
})
