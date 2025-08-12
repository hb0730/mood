import jwt from 'jsonwebtoken'
import { prisma } from '../../../prisma'

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
  
  try {
    // 批量隐藏所有被举报且未被隐藏的帖子
    const result = await prisma.emotionPost.updateMany({
      where: {
        isReported: true,
        isHidden: false
      },
      data: {
        isHidden: true
      }
    })
    
    return {
      success: true,
      message: '批量隐藏操作完成',
      hiddenCount: result.count
    }
  } catch (error) {
    console.error('Batch hide reported posts error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '批量隐藏操作失败'
    })
  }
})
