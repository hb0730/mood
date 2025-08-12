import { z } from 'zod'
import { prisma } from '~/server/prisma'

// 输入验证
const reportPostSchema = z.object({
  reason: z.string().optional(), // 举报原因（可选）
  userId: z.string().min(1) // 举报者用户ID
})

export default defineEventHandler(async (event) => {
  try {
    const postId = getRouterParam(event, 'id')
    
    if (!postId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少帖子ID'
      })
    }

    // 验证请求体
    const body = await readBody(event)
    const { reason, userId } = reportPostSchema.parse(body)

    // 检查帖子是否存在
    const post = await prisma.emotionPost.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: '帖子不存在'
      })
    }

    // 检查是否已经被同一用户举报
    if (post.isReported && post.reportedBy === userId) {
      throw createError({
        statusCode: 409,
        statusMessage: '您已经举报过此内容'
      })
    }

    // 更新举报状态
    await prisma.emotionPost.updateMany({
      where: { id: postId },
      data: { 
        isReported: true,
        reportedBy: userId
      }
    })
    
    // 重新查询确认更新
    const updatedPost = await prisma.emotionPost.findUnique({
      where: { id: postId }
    })

    return {
      success: true,
      message: '举报成功',
      post: updatedPost
    }
  } catch (error: any) {
    console.error('举报API错误:', error)
    
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: '请求参数无效'
      })
    }
    
    // 如果是已知错误，重新抛出
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '举报失败'
    })
  }
})
