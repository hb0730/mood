export default defineEventHandler(async (event) => {
  try {
    // 检查数据库连接
    const { prisma } = await import('../prisma')
    
    // 简单的数据库连接测试
    await prisma.$queryRaw`SELECT 1`
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      version: '1.0.0'
    }
  } catch (error) {
    // 如果数据库连接失败，返回不健康状态
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      version: '1.0.0'
    }
  }
})
