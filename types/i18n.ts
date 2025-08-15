// 国际化类型定义
export type AppTranslationKey = 
  | 'app.name'
  | 'app.description'
  | 'app.tagline'

export type EmotionsTranslationKey = 
  | 'emotions.happy'
  | 'emotions.sad'
  | 'emotions.angry'
  | 'emotions.excited'
  | 'emotions.anxious'
  | 'emotions.calm'
  | 'emotions.confused'
  | 'emotions.grateful'
  | 'emotions.neutral'
  | 'emotions.selectTitle'
  | 'emotions.happyDesc'
  | 'emotions.sadDesc'
  | 'emotions.angryDesc'
  | 'emotions.anxiousDesc'
  | 'emotions.excitedDesc'
  | 'emotions.frustratedDesc'
  | 'emotions.gratefulDesc'
  | 'emotions.neutralDesc'

export type ActionsTranslationKey = 
  | 'actions.post'
  | 'actions.comment'
  | 'actions.like'
  | 'actions.report'
  | 'actions.share'
  | 'actions.edit'
  | 'actions.delete'
  | 'actions.cancel'
  | 'actions.confirm'
  | 'actions.submit'
  | 'actions.refresh'
  | 'actions.clearFilter'
  | 'actions.loadMore'

export type MessagesTranslationKey = 
  | 'messages.postCreated'
  | 'messages.commentAdded'
  | 'messages.likeUpdated'
  | 'messages.reportSubmitted'
  | 'messages.errorOccurred'
  | 'messages.loading'
  | 'messages.noData'
  | 'messages.success'
  | 'messages.contentReported'
  | 'messages.contentUnderReview'
  | 'messages.underReview'
  | 'messages.reported'
  | 'messages.noPosts'
  | 'messages.beFirstToPost'

export type AdminTranslationKey = 
  | 'admin.title'
  | 'admin.dashboard'
  | 'admin.posts'
  | 'admin.comments'
  | 'admin.users'
  | 'admin.reports'
  | 'admin.stats'
  | 'admin.settings'

export type CommonTranslationKey = 
  | 'common.yes'
  | 'common.no'
  | 'common.ok'
  | 'common.close'
  | 'common.back'
  | 'common.next'
  | 'common.previous'
  | 'common.search'
  | 'common.filter'
  | 'common.sort'
  | 'common.anonymousUser'
  | 'common.allRightsReserved'
  | 'common.builtWith'

export type PostsTranslationKey = 
  | 'posts.allPosts'
  | 'posts.emotionPosts'

export type ModalsTranslationKey = 
  | 'modals.createPost.title'
  | 'modals.createPost.titleWithEmotion'
  | 'modals.createPost.selectEmotion'
  | 'modals.createPost.writeContent'
  | 'modals.createPost.contentPlaceholder'
  | 'modals.createPost.emojiSupport'
  | 'modals.createPost.addTags'
  | 'modals.createPost.tagPlaceholder'
  | 'modals.createPost.add'
  | 'modals.createPost.tagLimit'
  | 'modals.createPost.anonymous'
  | 'modals.createPost.displayName'
  | 'modals.createPost.namePlaceholder'
  | 'modals.createPost.nameLimit'
  | 'modals.createPost.privacyTitle'
  | 'modals.createPost.privacy1'
  | 'modals.createPost.privacy2'
  | 'modals.createPost.privacy3'
  | 'modals.createPost.cancel'
  | 'modals.createPost.submit'
  | 'modals.comments.title'
  | 'modals.comments.discussion'
  | 'modals.comments.anonymousUser'
  | 'modals.comments.commentReported'
  | 'modals.comments.underReview'
  | 'modals.comments.addComment'
  | 'modals.comments.commentPlaceholder'
  | 'modals.comments.submit'
  | 'modals.comments.noComments'
  | 'modals.comments.beFirst'
  | 'modals.stats.title'
  | 'modals.stats.totalPosts'
  | 'modals.stats.recentActivity'
  | 'modals.stats.activeUsers'
  | 'modals.stats.totalComments'
  | 'modals.stats.emotionDistribution'
  | 'modals.stats.hotTags'
  | 'modals.stats.noTagData'
  | 'modals.stats.publishTrend'
  | 'modals.stats.today'
  | 'modals.stats.week'
  | 'modals.stats.month'
  | 'modals.report.reportTitle'
  | 'modals.report.cancelReportTitle'
  | 'modals.report.postContent'
  | 'modals.report.commentContent'
  | 'modals.report.reportNotice'
  | 'modals.report.reportNotice1'
  | 'modals.report.reportNotice2'
  | 'modals.report.reportNotice3'
  | 'modals.report.reportReason'
  | 'modals.report.reportReasonOptional'
  | 'modals.report.selectReason'
  | 'modals.report.spam'
  | 'modals.report.harassment'
  | 'modals.report.inappropriate'
  | 'modals.report.misinformation'
  | 'modals.report.other'
  | 'modals.report.cancelReport'
  | 'modals.report.cancelReportDesc'
  | 'modals.report.cancel'
  | 'modals.report.confirm'

// 所有翻译键的联合类型
export type TranslationKey = 
  | AppTranslationKey
  | EmotionsTranslationKey
  | ActionsTranslationKey
  | MessagesTranslationKey
  | AdminTranslationKey
  | CommonTranslationKey
  | PostsTranslationKey
  | ModalsTranslationKey

// 翻译函数的类型
export type TranslationFunction = (key: TranslationKey, params?: Record<string, any>) => string

// 语言代码类型
export type LocaleCode = 'zh-CN' | 'en' | 'ja'

// 支持的语言配置类型
export interface LocaleConfig {
  code: LocaleCode
  name: string
  flag: string
}

// 情绪类型
export type EmotionType = 'happy' | 'sad' | 'angry' | 'excited' | 'anxious' | 'frustrated' | 'grateful' | 'neutral'

// 情绪配置类型
export interface EmotionConfig {
  type: EmotionType
  label: string
  icon: string
  description: string
}
