#!/usr/bin/env node

/**
 * 数据清理脚本 (CommonJS版本)
 * 用于清理测试数据、重复数据、过期数据等
 */

const { PrismaClient } = require('@prisma/client')
const readline = require('readline')

const prisma = new PrismaClient()

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// 询问用户选择
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

// 显示清理选项
const showMenu = () => {
  console.log('\n🧹 数据清理工具')
  console.log('================')
  console.log('1. 查看当前数据统计')
  console.log('2. 清理测试数据 (内容包含 "test" 或 "测试")')
  console.log('3. 清理重复的帖子')
  console.log('4. 清理重复的评论')
  console.log('5. 清理过期的举报 (7天前)')
  console.log('6. 清理空内容帖子')
  console.log('7. 清理空内容评论')
  console.log('8. 清理孤立评论 (帖子已删除)')
  console.log('9. 清理所有数据 (危险操作)')
  console.log('0. 退出')
  console.log('================')
}

// 查看数据统计
const showStats = async () => {
  try {
    const postCount = await prisma.post.count()
    const commentCount = await prisma.comment.count()
    const reportCount = await prisma.report.count()
    
    console.log('\n📊 当前数据统计:')
    console.log(`帖子数量: ${postCount}`)
    console.log(`评论数量: ${commentCount}`)
    console.log(`举报数量: ${reportCount}`)
    
    // 按情绪类型统计
    const emotionStats = await prisma.post.groupBy({
      by: ['emotion'],
      _count: { emotion: true }
    })
    
    console.log('\n😊 情绪分布:')
    emotionStats.forEach(stat => {
      console.log(`${stat.emotion}: ${stat._count.emotion}`)
    })
    
  } catch (error) {
    console.error('❌ 获取统计信息失败:', error.message)
  }
}

// 清理测试数据
const cleanTestData = async () => {
  try {
    console.log('\n🧹 开始清理测试数据...')
    
    // 清理测试帖子
    const deletedPosts = await prisma.post.deleteMany({
      where: {
        OR: [
          { content: { contains: 'test', mode: 'insensitive' } },
          { content: { contains: '测试', mode: 'insensitive' } },
          { content: { contains: 'TEST', mode: 'insensitive' } }
        ]
      }
    })
    
    // 清理测试评论
    const deletedComments = await prisma.comment.deleteMany({
      where: {
        OR: [
          { content: { contains: 'test', mode: 'insensitive' } },
          { content: { contains: '测试', mode: 'insensitive' } },
          { content: { contains: 'TEST', mode: 'insensitive' } }
        ]
      }
    })
    
    console.log(`✅ 清理完成! 删除了 ${deletedPosts.count} 个测试帖子, ${deletedComments.count} 个测试评论`)
    
  } catch (error) {
    console.error('❌ 清理测试数据失败:', error.message)
  }
}

// 清理重复帖子
const cleanDuplicatePosts = async () => {
  try {
    console.log('\n🧹 开始清理重复帖子...')
    
    // 查找重复帖子 (基于内容)
    const duplicates = await prisma.$queryRaw`
      SELECT content, COUNT(*) as count, MIN(id) as keep_id
      FROM Post 
      GROUP BY content 
      HAVING COUNT(*) > 1
    `
    
    if (duplicates.length === 0) {
      console.log('✅ 没有发现重复帖子')
      return
    }
    
    console.log(`发现 ${duplicates.length} 组重复帖子`)
    
    let deletedCount = 0
    for (const dup of duplicates) {
      // 保留最早的，删除其他的
      const deleted = await prisma.post.deleteMany({
        where: {
          content: dup.content,
          id: { not: dup.keep_id }
        }
      })
      deletedCount += deleted.count
    }
    
    console.log(`✅ 清理完成! 删除了 ${deletedCount} 个重复帖子`)
    
  } catch (error) {
    console.error('❌ 清理重复帖子失败:', error.message)
  }
}

// 清理重复评论
const cleanDuplicateComments = async () => {
  try {
    console.log('\n🧹 开始清理重复评论...')
    
    // 查找重复评论 (基于内容、帖子ID)
    const duplicates = await prisma.$queryRaw`
      SELECT content, "postId", COUNT(*) as count, MIN(id) as keep_id
      FROM Comment 
      GROUP BY content, "postId"
      HAVING COUNT(*) > 1
    `
    
    if (duplicates.length === 0) {
      console.log('✅ 没有发现重复评论')
      return
    }
    
    console.log(`发现 ${duplicates.length} 组重复评论`)
    
    let deletedCount = 0
    for (const dup of duplicates) {
      // 保留最早的，删除其他的
      const deleted = await prisma.comment.deleteMany({
        where: {
          content: dup.content,
          postId: dup.postId,
          id: { not: dup.keep_id }
        }
      })
      deletedCount += deleted.count
    }
    
    console.log(`✅ 清理完成! 删除了 ${deletedCount} 个重复评论`)
    
  } catch (error) {
    console.error('❌ 清理重复评论失败:', error.message)
  }
}

// 清理过期举报
const cleanExpiredReports = async () => {
  try {
    console.log('\n🧹 开始清理过期举报...')
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const deletedReports = await prisma.report.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo
        }
      }
    })
    
    console.log(`✅ 清理完成! 删除了 ${deletedReports.count} 个过期举报`)
    
  } catch (error) {
    console.error('❌ 清理过期举报失败:', error.message)
  }
}

// 清理空内容帖子
const cleanEmptyPosts = async () => {
  try {
    console.log('\n🧹 开始清理空内容帖子...')
    
    const deletedPosts = await prisma.post.deleteMany({
      where: {
        OR: [
          { content: '' },
          { content: null },
          { content: { equals: '   ' } } // 只包含空格的帖子
        ]
      }
    })
    
    console.log(`✅ 清理完成! 删除了 ${deletedPosts.count} 个空内容帖子`)
    
  } catch (error) {
    console.error('❌ 清理空内容帖子失败:', error.message)
  }
}

// 清理空内容评论
const cleanEmptyComments = async () => {
  try {
    console.log('\n🧹 开始清理空内容评论...')
    
    const deletedComments = await prisma.comment.deleteMany({
      where: {
        OR: [
          { content: '' },
          { content: null },
          { content: { equals: '   ' } } // 只包含空格的评论
        ]
      }
    })
    
    console.log(`✅ 清理完成! 删除了 ${deletedComments.count} 个空内容评论`)
    
  } catch (error) {
    console.error('❌ 清理空内容评论失败:', error.message)
  }
}

// 清理孤立评论
const cleanOrphanComments = async () => {
  try {
    console.log('\n🧹 开始清理孤立评论...')
    
    // 查找帖子ID不存在的评论
    const orphanComments = await prisma.comment.findMany({
      where: {
        postId: {
          not: null
        }
      },
      select: {
        id: true,
        postId: true
      }
    })
    
    let deletedCount = 0
    for (const comment of orphanComments) {
      const post = await prisma.post.findUnique({
        where: { id: comment.postId }
      })
      
      if (!post) {
        await prisma.comment.delete({
          where: { id: comment.id }
        })
        deletedCount++
      }
    }
    
    console.log(`✅ 清理完成! 删除了 ${deletedCount} 个孤立评论`)
    
  } catch (error) {
    console.error('❌ 清理孤立评论失败:', error.message)
  }
}

// 清理所有数据 (危险操作)
const cleanAllData = async () => {
  try {
    const confirm = await question('\n⚠️  警告: 这将删除所有数据! 输入 "DELETE ALL" 确认: ')
    
    if (confirm !== 'DELETE ALL') {
      console.log('❌ 操作已取消')
      return
    }
    
    console.log('\n🧹 开始清理所有数据...')
    
    // 按顺序删除 (先删除依赖数据)
    await prisma.comment.deleteMany({})
    await prisma.report.deleteMany({})
    await prisma.post.deleteMany({})
    
    console.log('✅ 所有数据已清理完成!')
    
  } catch (error) {
    console.error('❌ 清理所有数据失败:', error.message)
  }
}

// 主函数
const main = async () => {
  try {
    console.log('🚀 数据清理工具启动...')
    
    while (true) {
      showMenu()
      const choice = await question('\n请选择操作 (0-9): ')
      
      switch (choice) {
        case '1':
          await showStats()
          break
        case '2':
          await cleanTestData()
          break
        case '3':
          await cleanDuplicatePosts()
          break
        case '4':
          await cleanDuplicateComments()
          break
        case '5':
          await cleanExpiredReports()
          break
        case '6':
          await cleanEmptyPosts()
          break
        case '7':
          await cleanEmptyComments()
          break
        case '8':
          await cleanOrphanComments()
          break
        case '9':
          await cleanAllData()
          break
        case '0':
          console.log('👋 再见!')
          rl.close()
          process.exit(0)
        default:
          console.log('❌ 无效选择，请重新输入')
      }
      
      await question('\n按回车键继续...')
    }
    
  } catch (error) {
    console.error('❌ 程序运行错误:', error.message)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

// 运行主函数
main().catch(console.error)
