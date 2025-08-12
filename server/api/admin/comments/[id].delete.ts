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
  
  const commentId = getRouterParam(event, 'id')
  if (!commentId) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少评论ID'
    })
  }
  
  try {
    await prisma.comment.delete({
      where: { id: commentId }
    })
    
    return { success: true, message: '评论已删除' }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '删除失败'
    })
  }
})
