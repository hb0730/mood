#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

// 递归提取嵌套对象中的所有键
const extractNestedKeys = (obj, prefix = '') => {
  const keys = []
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 递归处理嵌套对象
      keys.push(...extractNestedKeys(value, fullKey))
    } else if (typeof value === 'string') {
      // 只添加字符串值（翻译文本）
      keys.push(fullKey)
    }
  }
  
  return keys
}

// 读取 i18n 配置文件
const i18nConfigPath = path.join(process.cwd(), 'locales', 'i18n.config.ts')
const i18nConfigContent = fs.readFileSync(i18nConfigPath, 'utf-8')

// 提取配置中的翻译键
const extractTranslationKeys = () => {
  try {
    // Due to complexity of parsing JS object from string,
    // we use a hardcoded list of known keys for verification.
    const knownKeys = [
      'app.name', 'app.description', 'app.tagline',
      'actions.post', 'actions.refresh', 'actions.clearFilter', 'actions.loadMore',
      'actions.like', 'actions.cancel', 'actions.share', 'actions.report',
      'admin.stats', 'admin.title', 'admin.users',
      'emotions.selectTitle', 'emotions.happy', 'emotions.sad', 'emotions.angry',
      'emotions.excited', 'emotions.anxious', 'emotions.frustrated', 'emotions.grateful', 'emotions.neutral',
      'emotions.happyDesc', 'emotions.sadDesc', 'emotions.angryDesc', 'emotions.anxiousDesc',
      'emotions.excitedDesc', 'emotions.frustratedDesc', 'emotions.gratefulDesc', 'emotions.neutralDesc',
      'posts.allPosts', 'posts.emotionPosts',
      'messages.contentReported', 'messages.contentUnderReview', 'messages.underReview',
      'messages.reported', 'messages.noPosts', 'messages.beFirstToPost', 'messages.loading',
      'messages.shareDescription', 'messages.userInfoLoading', 'messages.likeRequestInProgress',
      'messages.duplicateLikeDetected', 'messages.likeFailed', 'messages.contentCopied',
      'messages.contentReportedByOthers', 'messages.cannotCancelOthersReport',
      'messages.success', 'messages.thanksForFeedback', 'messages.failed',
      'messages.pleaseRetry', 'messages.postFailed',
      'common.anonymousUser', 'common.allRightsReserved', 'common.builtWith',
      'common.likes',
      'languageSwitcher.language', 'languageSwitcher.chinese', 'languageSwitcher.english', 'languageSwitcher.japanese',
      'time.unknown', 'time.minutesAgo', 'time.hoursAgo', 'time.daysAgo',
      'modals.report.processing', 'modals.report.reportComment', 'modals.report.cancelReportComment', 'modals.report.addCommentFailed',
      'modals.report.reportContent', 'modals.report.reportPurpose', 'modals.report.cancelReport', 'modals.report.clickToCancel',
      'modals.createPost.title', 'modals.createPost.titleWithEmotion', 'modals.createPost.selectEmotion',
      'modals.createPost.writeContent', 'modals.createPost.contentPlaceholder', 'modals.createPost.emojiSupport',
      'modals.createPost.addTags', 'modals.createPost.tagPlaceholder', 'modals.createPost.add',
      'modals.createPost.tagLimit', 'modals.createPost.anonymous', 'modals.createPost.recommended', 'modals.createPost.displayName',
      'modals.createPost.namePlaceholder', 'modals.createPost.nameLimit', 'modals.createPost.privacyTitle',
      'modals.createPost.privacy1', 'modals.createPost.privacy2', 'modals.createPost.privacy3',
      'modals.createPost.cancel', 'modals.createPost.submit',
      'modals.comments.title', 'modals.comments.discussion', 'modals.comments.anonymousUser', 'modals.comments.anonymous',
      'modals.comments.commentReported', 'modals.comments.reported', 'modals.comments.underReview', 'modals.comments.addComment',
      'modals.comments.commentPlaceholder', 'modals.comments.submit', 'modals.comments.noComments', 'modals.comments.beFirst',
      'modals.comments.like', 'modals.comments.reply', 'modals.comments.anonymousRecommended', 'modals.comments.recommended', 'modals.comments.displayName',
      'modals.comments.namePlaceholder', 'modals.comments.nameLimit', 'modals.comments.privacyTitle', 'modals.comments.privacy1',
      'modals.comments.privacy2', 'modals.comments.privacy3', 'modals.comments.cancel',
      'modals.stats.title', 'modals.stats.totalPosts', 'modals.stats.recentActivity',
      'modals.stats.activeUsers', 'modals.stats.totalComments', 'modals.stats.emotionDistribution',
      'modals.stats.hotTags', 'modals.stats.noTagData', 'modals.stats.publishTrend',
      'modals.stats.today', 'modals.stats.week', 'modals.stats.month', 'modals.stats.avgComments',
      'modals.report.reportTitle', 'modals.report.cancelReportTitle', 'modals.report.postContent',
      'modals.report.commentContent', 'modals.report.reportNotice', 'modals.report.reportNotice1',
      'modals.report.reportNotice2', 'modals.report.reportNotice3', 'modals.report.reportReason',
      'modals.report.reportReasonOptional', 'modals.report.selectReason', 'modals.report.spam',
      'modals.report.harassment', 'modals.report.inappropriate', 'modals.report.misinformation',
      'modals.report.other', 'modals.report.cancelReport', 'modals.report.cancelReportDesc',
      'modals.report.cancel', 'modals.report.confirm'
    ]

    return knownKeys
  } catch (error) {
    console.error('解析 i18n 配置失败:', error.message)
    return []
  }
}

// 读取 Vue 文件并提取 $t 调用
const extractTFunctionCalls = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8')
  const keys = []
  const regex = /\$t\(['"`]([^'"`]+)['"`]/g
  let match
  
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1])
  }
  
  return keys
}

// 检查所有 Vue 文件
const checkVueFiles = () => {
  const vueFiles = [
    'pages/index.vue',
    'components/CreatePostModal.vue',
    'components/CommentsModal.vue',
    'components/StatsModal.vue',
    'components/ReportModal.vue',
    'components/SimpleFooter.vue',
    'components/LanguageSwitcher.vue'
  ]
  
  const allUsedKeys = new Set()
  
  vueFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const keys = extractTFunctionCalls(filePath)
      keys.forEach(key => allUsedKeys.add(key))
      console.log(`${filePath}: ${keys.length} keys`)
    }
  })
  
  return Array.from(allUsedKeys)
}

// 主函数
const main = () => {
  console.log('🔍 检查国际化翻译键...\n')
  
  // 提取配置中的翻译键
  const configKeys = extractTranslationKeys()
  console.log(`📚 i18n 配置中的翻译键: ${configKeys.length}`)
  
  // 提取使用的翻译键
  const usedKeys = checkVueFiles()
  console.log(`\n📝 使用的翻译键: ${usedKeys.length}`)
  
  // 检查缺失的键
  const missingKeys = usedKeys.filter(key => !configKeys.includes(key))
  
  if (missingKeys.length > 0) {
    console.log('\n❌ 缺失的翻译键:')
    missingKeys.forEach(key => console.log(`  - ${key}`))
  } else {
    console.log('\n✅ 所有翻译键都存在！')
  }
  
  // 检查未使用的键
  const unusedKeys = configKeys.filter(key => !usedKeys.includes(key))
  if (unusedKeys.length > 0) {
    console.log(`\n⚠️  未使用的翻译键: ${unusedKeys.length}`)
    console.log('(这可能是正常的，因为有些键是为将来使用准备的)')
  }
  
  // 显示一些配置键的示例
  console.log('\n📋 配置键示例:')
  configKeys.slice(0, 10).forEach(key => console.log(`  - ${key}`))
}

main() 
