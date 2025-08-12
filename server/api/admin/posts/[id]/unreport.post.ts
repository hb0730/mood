import jwt from 'jsonwebtoken'
import { prisma } from '../../../../prisma'

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
  
  const postId = getRouterParam(event, 'id')
  if (!postId) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少帖子ID'
    })
  }
  
  try {
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
    
    // 撤销举报状态，清除举报相关字段
    const updatedPost = await prisma.emotionPost.update({
      where: { id: postId },
      data: {
        isReported: false,
        reportedBy: null
      }
    })
    
    return {
      success: true,
      message: '举报状态已撤销',
      post: updatedPost
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Unreport post error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '撤销举报失败'
    })
  }
})
