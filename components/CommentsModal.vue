<template>
  <div class="fixed inset-0 flex items-center justify-center p-4 modal-overlay" data-modal="true">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden modal-content flex flex-col">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100 modal-header flex-shrink-0">
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('modals.comments.title') }}</h2>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <div class="i-mdi-close text-2xl"></div>
        </button>
      </div>

      <!-- 模态框主体内容 -->
      <div class="modal-body scrollable flex-1">

      <!-- 原帖内容 -->
      <div v-if="post" class="p-6 border-b border-gray-100">
        <div class="flex items-start space-x-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <div :class="`i-${getEmotionIcon(post.emotion).replace(':', '-')} text-white`"></div>
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">
              {{ post.isAnonymous ? $t('modals.comments.anonymousUser') : post.author || $t('modals.comments.anonymousUser') }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatTime(post.timestamp) }}
            </p>
          </div>
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {{ getEmotionLabel(post.emotion) }}
          </span>
        </div>
        
        <p class="text-gray-800 text-lg leading-relaxed">{{ post.content }}</p>
        
        <div v-if="post.tags && post.tags.length > 0" class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm"
          >
            #{{ tag }}
          </span>
        </div>
      </div>

        <!-- 评论列表 -->
        <div class="p-6 space-y-6">
          <div class="flex items-center space-x-3">
            <div class="i-mdi-comment-text-multiple text-xl text-blue-500"></div>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ $t('modals.comments.discussion') }}
            </h3>
            <span class="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
              {{ post?.comments?.length || 0 }}
            </span>
          </div>
          
          <div v-if="post?.comments && post.comments.length > 0" class="space-y-4 overflow-y-auto scrollable" style="max-height: 60vh;">
            <div
              v-for="(comment, index) in post.comments"
              :key="comment.id"
              :class="[
                'group relative rounded-xl p-4 transition-all duration-200',
                // 暂时隐藏举报相关的样式
                // comment.isReported 
                //   ? 'bg-red-50 border-2 border-red-200 hover:border-red-300' 
                //   : 'bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md'
                'bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md'
              ]"
            >
              <!-- 被举报评论警告横幅 -->
              <!-- 暂时隐藏举报相关展示 -->
              <!-- <div 
                v-if="comment.isReported" 
                class="mb-3 p-2 bg-gradient-to-r from-red-50 to-orange-50 border-l-3 border-red-400 rounded-r-md"
              >
                <div class="flex items-center space-x-2">
                  <div class="i-mdi-flag text-red-500 text-xs animate-pulse"></div>
                  <span class="text-xs font-medium text-red-700">{{ $t('modals.comments.commentReported') }}</span>
                  <div class="text-xs text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full border border-red-200">
                    {{ $t('modals.comments.underReview') }}
                  </div>
                </div>
              </div> -->
              
              <!-- 连接线（除了最后一个评论） -->
              <div 
                v-if="index < post.comments.length - 1"
                class="absolute left-6 top-12 w-0.5 h-4 bg-gradient-to-b from-gray-200 to-transparent"
              ></div>
              
              <div class="flex items-start space-x-3">
                <!-- 头像 -->
                <div class="flex-shrink-0">
                  <div 
                    :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      comment.isAnonymous 
                        ? 'bg-gradient-to-br from-gray-400 to-gray-600' 
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    ]"
                  >
                    <div 
                      :class="`i-mdi-${comment.isAnonymous ? 'incognito' : 'account-circle'} text-white text-lg`"
                    ></div>
                  </div>
                </div>
                
                <!-- 评论内容 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <span class="font-medium text-gray-900">
                        {{ comment.isAnonymous ? $t('modals.comments.anonymousUser') : comment.author || $t('modals.comments.anonymousUser') }}
                      </span>
                      <span 
                        v-if="comment.isAnonymous"
                        class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                      >
                        {{ $t('modals.comments.anonymous') }}
                      </span>
                      <!-- 被举报状态标识 -->
                      <!-- 暂时隐藏举报状态展示 -->
                      <!-- <span 
                        v-if="comment.isReported"
                        class="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium flex items-center space-x-1 border border-red-200 animate-pulse"
                        :title="$t('modals.comments.commentReported')"
                      >
                        <div class="i-mdi-flag text-xs"></div>
                        <span>{{ $t('modals.comments.reported') }}</span>
                      </span> -->
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-500">
                        {{ formatTime(comment.timestamp) }}
                      </span>
                      <div class="i-mdi-clock-outline text-gray-400 text-sm"></div>
                    </div>
                  </div>
                  
                  <!-- 评论文本 -->
                  <div class="bg-gray-50 rounded-lg p-3 group-hover:bg-blue-50 transition-colors duration-200">
                    <p class="text-gray-700 leading-relaxed">{{ comment.content }}</p>
                  </div>
                  
                  <!-- 互动按钮 -->
                  <!-- 暂时隐藏赞同、回复和举报功能 -->
                  <!-- <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button class="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors text-sm">
                        <div class="i-mdi-heart-outline text-sm"></div>
                        <span>{{ $t('modals.comments.like') }}</span>
                      </button>
                      <button class="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors text-sm">
                        <div class="i-mdi-reply text-sm"></div>
                        <span>{{ $t('modals.comments.reply') }}</span>
                      </button>
                    </div>
                    
                    <button 
                      @click="toggleReportComment(comment)"
                      :disabled="reportingComments.has(comment.id)"
                      :class="[
                        'flex items-center space-x-1 text-sm transition-all duration-200',
                        comment.isReported 
                          ? 'text-red-500 hover:text-red-600 opacity-100' 
                          : 'text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100',
                        reportingComments.has(comment.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      ]"
                      :title="getCommentReportTitle(comment)"
                    >
                      <div 
                        v-if="reportingComments.has(comment.id)"
                        class="i-mdi-loading animate-spin text-xs" 
                      ></div>
                      <div 
                        v-else
                        :class="`i-mdi-${comment.isReported ? 'flag' : 'flag-outline'} text-xs ${comment.isReported ? 'text-red-500 animate-pulse' : 'hover:scale-110 transition-transform'}`"
                      ></div>
                      <span v-if="comment.isReported" class="text-xs">
                        {{ getCommentReportLabel(comment) }}
                      </span>
                    </button>
                  </div> -->
                </div>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div v-else class="text-center py-12">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div class="i-mdi-comment-outline text-3xl text-blue-500"></div>
            </div>
            <h4 class="text-lg font-medium text-gray-700 mb-2">{{ $t('modals.comments.noComments') }}</h4>
            <p class="text-gray-500 mb-4">{{ $t('modals.comments.beFirst') }}</p>
            <div class="flex justify-center">
              <button
                @click="focusCommentInput"
                class="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <div class="i-mdi-comment-plus"></div>
                <span>{{ $t('modals.comments.addComment') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加评论 -->
      <div class="p-6 border-t border-gray-100 modal-footer bg-gradient-to-r from-blue-50 to-purple-50">
        <div class="flex items-center space-x-3 mb-4">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <div class="i-mdi-comment-plus text-white text-lg"></div>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('modals.comments.addComment') }}</h3>
            <p class="text-sm text-gray-600">{{ $t('modals.comments.commentPlaceholder') }}</p>
          </div>
        </div>
        
        <form @submit.prevent="submitComment" class="space-y-4">
          <!-- 文本输入区域 -->
          <div class="relative">
            <textarea
              v-model="commentContent"
              :placeholder="$t('modals.comments.commentPlaceholder')"
              class="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
              rows="4"
              maxlength="500"
              required
            ></textarea>
            
            <!-- 字符计数指示器 -->
            <div class="absolute bottom-3 right-3 flex items-center space-x-2">
              <span 
                :class="[
                  'text-xs font-medium px-2 py-1 rounded-full',
                  commentContent.length > 450 ? 'bg-red-100 text-red-600' :
                  commentContent.length > 300 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-500'
                ]"
              >
                {{ commentContent.length }}/500
              </span>
            </div>
          </div>
          
          <!-- 匿名选项和操作区域 -->
          <div class="flex flex-col space-y-4">
            <!-- 匿名选项和作者输入 -->
            <div class="space-y-3">
              <!-- 匿名选项 -->
              <div class="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <input
                  id="commentAnonymous"
                  v-model="isCommentAnonymous"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label for="commentAnonymous" class="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <div class="i-mdi-incognito text-gray-500"></div>
                  <span>{{ $t('modals.comments.anonymousRecommended') }}</span>
                  <span class="text-xs text-gray-500">{{ $t('modals.comments.recommended') }}</span>
                </label>
              </div>
              
              <!-- 非匿名时的作者输入框 -->
              <div v-if="!isCommentAnonymous" class="space-y-2">
                <label for="commentAuthor" class="flex items-center text-sm font-medium text-gray-700">
                  <div class="i-mdi-account-edit mr-1 flex-shrink-0"></div>
                  <span>{{ $t('modals.comments.displayName') }}</span>
                </label>
                <input
                  id="commentAuthor"
                  v-model="commentAuthor"
                  type="text"
                  :placeholder="$t('modals.comments.namePlaceholder')"
                  maxlength="20"
                  required
                  class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                />
                <div class="text-xs text-gray-500 flex items-center">
                  <div class="i-mdi-information-outline mr-1 flex-shrink-0"></div>
                  <span>{{ $t('modals.comments.nameLimit') }}</span>
                </div>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                @click="$emit('close')"
                class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors duration-200"
              >
                {{ $t('modals.comments.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="!commentContent.trim() || isSubmitting || (!isCommentAnonymous && !commentAuthor.trim())"
                :class="[
                  'flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200',
                  (commentContent.trim() && !isSubmitting && (isCommentAnonymous || commentAuthor.trim())) 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-105' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]"
              >
                <div 
                  v-if="isSubmitting"
                  class="i-mdi-loading animate-spin"
                ></div>
                <div 
                  v-else
                  :class="`i-mdi-${commentContent.trim() ? 'send' : 'send-outline'} ${commentContent.trim() ? 'animate-pulse' : ''}`"
                ></div>
                <span>{{ isSubmitting ? $t('messages.loading') : $t('modals.comments.submit') }}</span>
              </button>
            </div>
          </div>
          
          <!-- 提示信息 -->
          <div class="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="i-mdi-information text-blue-500 text-sm mt-0.5 flex-shrink-0"></div>
            <div class="text-xs text-blue-700">
              <p class="font-medium mb-1">{{ $t('modals.comments.privacyTitle') }}</p>
              <ul class="space-y-0.5 list-disc list-inside text-blue-600">
                <li>{{ $t('modals.comments.privacy1') }}</li>
                <li>{{ $t('modals.comments.privacy2') }}</li>
                <li>{{ $t('modals.comments.privacy3') }}</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '#imports'
import type { EmotionPost, EmotionType } from '../types/emotion'

// 定义props
interface Props {
  post: EmotionPost | null
}

const props = defineProps<Props>()

// 国际化
const { t: $t } = useI18n()

// 定义事件
const emit = defineEmits<{
  close: []
  'comment-added': [postId: string]
  'report-comment': [reportData: {
    type: 'comment'
    id: string
    content: string
    isReporting: boolean
  }]
}>()

// 响应式数据
const commentContent = ref('')
const isCommentAnonymous = ref(true)
const commentAuthor = ref('')
const isSubmitting = ref(false)
const reportingComments = ref(new Set<string>())

// 获取当前用户ID（从localStorage）
const getCurrentUserId = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('userId') || ''
  }
  return ''
}

// 情绪配置 - 使用国际化
const emotionConfig = computed(() => ({
  happy: { label: $t('emotions.happy'), icon: 'mdi:emoticon-happy' },
  sad: { label: $t('emotions.sad'), icon: 'mdi:emoticon-sad' },
  angry: { label: $t('emotions.angry'), icon: 'mdi:emoticon-angry' },
  anxious: { label: $t('emotions.anxious'), icon: 'mdi:emoticon-confused' },
  excited: { label: $t('emotions.excited'), icon: 'mdi:emoticon-excited' },
  frustrated: { label: $t('emotions.frustrated'), icon: 'mdi:emoticon-cry' },
  grateful: { label: $t('emotions.grateful'), icon: 'mdi:emoticon-kiss' },
  neutral: { label: $t('emotions.neutral'), icon: 'mdi:emoticon-neutral' }
}))

// 方法
const getEmotionLabel = (emotion: EmotionType): string => {
  return emotionConfig.value[emotion]?.label || emotion
}

const getEmotionIcon = (emotion: EmotionType): string => {
  return emotionConfig.value[emotion]?.icon || 'mdi:emoticon-neutral'
}

const formatTime = (timestamp: Date | string): string => {
  const now = new Date()
  const timeObj = timestamp instanceof Date ? timestamp : new Date(timestamp)
  
  // 检查是否为有效日期
  if (isNaN(timeObj.getTime())) {
    return $t('time.unknown')
  }
  
  const diff = now.getTime() - timeObj.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) return $t('time.minutesAgo', { minutes })
  if (hours < 24) return $t('time.hoursAgo', { hours })
  if (days < 7) return $t('time.daysAgo', { days })
  
  return timeObj.toLocaleDateString()
}

const submitComment = async () => {
  if (!commentContent.value.trim() || !props.post || isSubmitting.value) return

  isSubmitting.value = true
  
  try {
    const comment = await $fetch(`/api/posts/${props.post.id}/comments`, {
      method: 'POST',
      body: {
        content: commentContent.value.trim(),
        isAnonymous: isCommentAnonymous.value,
        author: isCommentAnonymous.value ? undefined : (commentAuthor.value.trim() || undefined)
      }
    })

    // 将新评论添加到本地评论列表
    if (props.post.comments) {
      props.post.comments.push(comment)
    } else {
      props.post.comments = [comment]
    }

    // 触发事件
    emit('comment-added', props.post.id)
    
    // 清空表单
    commentContent.value = ''
    commentAuthor.value = ''
    isCommentAnonymous.value = true
  } catch (error) {
    console.error('添加评论失败:', error)
            alert($t('modals.report.addCommentFailed'))
  } finally {
    isSubmitting.value = false
  }
}

const focusCommentInput = () => {
  // 使用nextTick确保DOM已更新，然后聚焦到textarea
  setTimeout(() => {
    const textarea = document.querySelector('textarea')
    if (textarea) {
      textarea.focus()
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

const getCommentReportTitle = (comment: any): string => {
  if (reportingComments.value.has(comment.id)) {
          return $t('modals.report.processing')
  }
  
  if (!comment.isReported) {
          return $t('modals.report.reportComment')
  }
  
  const currentUserId = getCurrentUserId()
  if (comment.reportedBy === currentUserId) {
          return $t('modals.report.cancelReportComment')
  }
  
  return $t('modals.comments.commentReported')
}

const getCommentReportLabel = (comment: any): string => {
  const currentUserId = getCurrentUserId()
  return comment.reportedBy === currentUserId ? $t('messages.reported') : $t('messages.reported')
}

const toggleReportComment = (comment: any) => {
  // 防止重复操作
  if (reportingComments.value.has(comment.id)) {
    return
  }
  
  const currentUserId = getCurrentUserId()
  
  // 如果评论已被举报，且不是当前用户举报的，则不允许操作
  if (comment.isReported && comment.reportedBy !== currentUserId) {
    alert($t('modals.comments.commentReported'))
    return
  }
  
  // 添加到本地处理中状态
  reportingComments.value.add(comment.id)
  
  emit('report-comment', {
    type: 'comment',
    id: comment.id,
    content: comment.content,
    isReporting: !comment.isReported
  })
}

// 暴露清理状态方法给父组件使用
const clearReportingState = (commentId: string) => {
  reportingComments.value.delete(commentId)
}

defineExpose({
  clearReportingState
})
</script> 
