import { prisma } from '../prisma'

export default defineEventHandler(async (event) => {
  try {
    console.log('Testing Prisma connection in Nuxt...')
    
    // 测试数据库连接
    await prisma.$connect()
    console.log('Database connection successful')
    
    // 测试查询
    const count = await prisma.emotionPost.count()
    console.log(`Total posts in database: ${count}`)
    
    await prisma.$disconnect()
    console.log('Prisma test completed successfully')
    
    return {
      success: true,
      message: 'Prisma is working correctly',
      postCount: count
    }
    
  } catch (error) {
    console.error('Prisma test failed:', error)
    
    return {
      success: false,
      message: 'Prisma test failed',
      error: error.message
    }
  }
})
