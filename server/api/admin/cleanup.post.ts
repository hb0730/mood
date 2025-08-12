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
  const { days } = body
  
  if (!days || days < 30) {
    throw createError({
      statusCode: 400,
      statusMessage: '为了安全，只能删除30天以上的数据'
    })
  }
  
  try {
    // 计算截止日期
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    // 在事务中删除旧数据
    const result = await prisma.$transaction(async (tx) => {
      // 首先删除相关评论
      const deletedComments = await tx.comment.deleteMany({
        where: {
          post: {
            timestamp: {
              lt: cutoffDate
            }
          }
        }
      })
      
      // 删除点赞记录
      const deletedLikes = await tx.like.deleteMany({
        where: {
          post: {
            timestamp: {
              lt: cutoffDate
            }
          }
        }
      })
      
      // 最后删除帖子
      const deletedPosts = await tx.emotionPost.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate
          }
        }
      })
      
      return {
        deletedPosts: deletedPosts.count,
        deletedComments: deletedComments.count,
        deletedLikes: deletedLikes.count
      }
    })
    
    return {
      success: true,
      message: `成功清理${days}天前的数据`,
      deletedCount: result.deletedPosts,
      details: {
        posts: result.deletedPosts,
        comments: result.deletedComments,
        likes: result.deletedLikes
      }
    }
  } catch (error) {
    console.error('Cleanup old posts error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '清理操作失败'
    })
  }
})
