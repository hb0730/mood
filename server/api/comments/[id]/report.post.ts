import { z } from 'zod'
import { prisma } from '~/server/prisma'

// 输入验证
const reportCommentSchema = z.object({
  reason: z.string().optional(), // 举报原因（可选）
  userId: z.string().min(1) // 举报者用户ID
})

export default defineEventHandler(async (event) => {
  try {
    const commentId = getRouterParam(event, 'id')
    
    if (!commentId) {
      throw createError({
        statusCode: 400,
        statusMessage: '缺少评论ID'
      })
    }

    // 验证请求体
    const body = await readBody(event)
    const { reason, userId } = reportCommentSchema.parse(body)

    // 检查评论是否存在
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      throw createError({
        statusCode: 404,
        statusMessage: '评论不存在'
      })
    }

    // 检查是否已经被同一用户举报
    if (comment.isReported && comment.reportedBy === userId) {
      throw createError({
        statusCode: 409,
        statusMessage: '您已经举报过此评论'
      })
    }

    // 更新评论的举报状态
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { 
        isReported: true,
        reportedBy: userId
      }
    })

    return {
      message: '举报成功',
      comment: updatedComment
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: '请求参数无效'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: '举报失败'
    })
  }
})
