import { z } from 'zod'
import { prisma } from '../../../prisma'

const schema = z.object({
  userId: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const { userId } = schema.parse(body)
  
  try {
    // 使用事务确保原子性操作
    const result = await prisma.$transaction(async (tx) => {
      // 检查是否已经点赞
      const existingLike = await tx.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId: id
          }
        }
      })
      
      if (existingLike) {
        // 如果已经点赞，取消点赞
        await tx.like.delete({
          where: { id: existingLike.id }
        })
        
        // 减少点赞数
        const updated = await tx.emotionPost.update({
          where: { id },
          data: { likes: { decrement: 1 } },
          include: {
            likedBy: true,
            comments: true
          }
        })
        
        return {
          ...updated,
          liked: false
        }
      } else {
        // 如果没有点赞，添加点赞
        await tx.like.create({
          data: {
            userId,
            postId: id
          }
        })
        
        // 增加点赞数
        const updated = await tx.emotionPost.update({
          where: { id },
          data: { likes: { increment: 1 } },
          include: {
            likedBy: true,
            comments: true
          }
        })
        
        return {
          ...updated,
          liked: true
        }
      }
    }, {
      // 设置事务超时和隔离级别
      maxWait: 5000, // 最大等待5秒
      timeout: 10000, // 超时10秒
    })

    return result
  } catch (error: any) {
    console.error('Like operation failed:', error)
    
    // 如果是唯一约束错误，说明已经点赞了
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        statusMessage: '重复点赞'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '点赞操作失败'
    })
  }
})


