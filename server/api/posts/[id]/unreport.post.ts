import { z } from 'zod'
import { prisma } from '~/server/prisma'

// 输入验证
const unreportPostSchema = z.object({
  userId: z.string().min(1) // 用户ID
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
    const { userId } = unreportPostSchema.parse(body)

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

    // 检查是否有举报记录
    if (!post.isReported) {
      throw createError({
        statusCode: 400,
        statusMessage: '此内容未被举报'
      })
    }

    // 检查用户权限：只有举报者本人才能取消举报
    if (post.reportedBy !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: '只有举报者本人才能取消举报'
      })
    }

    // 更新帖子的举报状态
    const updatedPost = await prisma.emotionPost.update({
      where: { id: postId },
      data: { 
        isReported: false,
        reportedBy: null
      }
    })

    return {
      message: '取消举报成功',
      post: updatedPost
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
