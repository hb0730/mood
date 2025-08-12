import { z } from 'zod'
import { prisma } from '~/server/prisma'

// 输入验证
const unreportCommentSchema = z.object({
  userId: z.string().min(1) // 用户ID
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
    const { userId } = unreportCommentSchema.parse(body)

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

    // 检查是否有举报记录
    if (!comment.isReported) {
      throw createError({
        statusCode: 400,
        statusMessage: '此评论未被举报'
      })
    }

    // 检查用户权限：只有举报者本人才能取消举报
    if (comment.reportedBy !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: '只有举报者本人才能取消举报'
      })
    }

    // 更新评论的举报状态
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { 
        isReported: false,
        reportedBy: null
      }
    })

    return {
      message: '取消举报成功',
      comment: updatedComment
    }
  } catch (error: any) {
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
      statusMessage: '取消举报失败'
    })
  }
})
