<template>
  <div class="min-h-screen app-container">

    <nav class="bg-white/90 backdrop-blur-md shadow-lg navbar-fixed">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <div class="i-mdi-heart text-white text-xl"></div>
            </div>
            <h1 class="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <span class="hidden sm:inline">匿名情绪发泄站</span>
              <span class="sm:hidden">情绪发泄站</span>
            </h1>
          </div>
          
          <div class="flex items-center space-x-2 md:space-x-4">
            <button 
              @click="showCreatePost = true"
              class="btn-primary flex items-center space-x-1 md:space-x-2 text-sm md:text-base whitespace-nowrap"
            >
              <div class="i-mdi-plus text-base md:text-lg"></div>
              <span class="hidden sm:inline">发泄情绪</span>
              <span class="sm:hidden">发泄</span>
            </button>
            
            <button 
              @click="showStats = true"
              class="btn-secondary flex items-center space-x-1 md:space-x-2 text-sm md:text-base whitespace-nowrap"
            >
              <div class="i-mdi-chart-line text-base md:text-lg"></div>
              <span class="hidden sm:inline">统计</span>
              <span class="sm:hidden">数据</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28 md:pt-32 main-content">
       <div class="text-center mb-12" v-once>
        <h2 class="text-4xl font-bold text-white mb-4">
          在这里，你可以安全地发泄情绪
        </h2>
        <p class="text-xl text-white/90 max-w-2xl mx-auto">
          这是一个完全匿名的平台，没有人知道你是谁。说出你的心里话，释放内心的压力。
        </p>
      </div>

      <div class="mb-8">
        <h3 class="text-2xl font-semibold text-white mb-6 text-center">选择你的情绪状态</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto px-4">
          <button
            v-for="emotion in emotions"
            :key="emotion.type"
            @click="selectEmotion(emotion.type)"
            :class="[
              'emotion-card p-6 text-center transition-all duration-300',
              selectedEmotion === emotion.type ? 'ring-4 ring-white/50 scale-105' : ''
            ]"
          >
            <div :class="`i-${emotion.icon.replace(':', '-')} text-4xl mb-3 mx-auto`"></div>
            <h4 class="font-semibold text-lg mb-2">{{ emotion.label }}</h4>
            <p class="text-sm text-gray-600">{{ emotion.description }}</p>
          </button>
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-2xl font-semibold text-white">
            {{ selectedEmotion ? `${getEmotionLabel(selectedEmotion)}的帖子` : '所有帖子' }}
          </h3>
          <div class="flex space-x-2">
            <button 
              @click="refreshPosts"
              class="btn-secondary flex items-center space-x-2"
            >
              <div class="i-mdi-refresh"></div>
              <span>刷新</span>
            </button>
            <button 
              @click="clearFilter"
              v-if="selectedEmotion"
              class="btn-secondary flex items-center space-x-2"
            >
              <div class="i-mdi-close"></div>
              <span>清除筛选</span>
            </button>
          </div>
        </div>

        <div class="grid gap-6 scrollable px-4 py-2">
          <div
            v-for="post in filteredPosts"
            :key="post.id"
            v-memo="[post.likes, post.comments?.length || 0, post.isReported]"
            :class="[
              'emotion-card',
              post.isReported ? 'reported-content' : ''
            ]"
          >
            <!-- 被举报内容警告横幅 -->
            <div 
              v-if="post.isReported" 
              class="mb-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-lg"
            >
              <div class="flex items-center space-x-2">
                <div class="i-mdi-alert-circle text-red-500 animate-pulse"></div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-red-800">内容已被举报</p>
                  <p class="text-xs text-red-600">此内容已被用户举报，正在等待管理员审核。</p>
                </div>
                <div class="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full border border-red-200">
                  审核中
                </div>
              </div>
            </div>
            
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <div :class="`i-${getEmotionIcon(post.emotion).replace(':', '-')} text-white`"></div>
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ post.isAnonymous ? '匿名用户' : post.author || '匿名用户' }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ formatTime(post.timestamp) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <!-- 被举报状态标识 -->
                <div
                  v-if="post.isReported"
                  class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center space-x-1 border border-red-200 animate-pulse"
                  title="此内容已被举报，等待审核"
                >
                  <div class="i-mdi-flag text-xs"></div>
                  <span>已举报</span>
                </div>
                
                <!-- 情绪标签 -->
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {{ getEmotionLabel(post.emotion) }}
                </span>
              </div>
            </div>
            
            <div class="mb-4">
              <p class="text-gray-800 text-lg leading-relaxed">{{ post.content }}</p>
              <div v-if="post.tags && Array.isArray(post.tags) && post.tags.length > 0" class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="tag in post.tags"
                  :key="tag"
                  class="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
            
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <div class="flex items-center space-x-4">
                <button 
                  @click="likePost(post.id)"
                  :disabled="likingPosts.has(post.id)"
                  class="flex items-center space-x-2 transition-all duration-200"
                  :class="[
                    post.liked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500',
                    likingPosts.has(post.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  ]"
                  :title="likingPosts.has(post.id) ? '处理中...' : (post.liked ? `已点赞 - 点击取消点赞 (${post.likes}个赞)` : `为这条帖子点赞 (${post.likes}个赞)`)"
                >
                  <div 
                    v-if="likingPosts.has(post.id)"
                    class="i-mdi-loading animate-spin" 
                  ></div>
                  <div 
                    v-else
                    class="i-mdi-heart"
                    :class="post.liked ? 'text-red-500 animate-pulse' : 'hover:scale-110 transition-transform'" 
                  ></div>
                  <span>{{ post.likes }}</span>
                </button>
                <button 
                  @click="showComments(post.id)"
                  class="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <div class="i-mdi-comment"></div>
                  <span>{{ post.comments?.length || 0 }}</span>
                </button>
              </div>
              
              <div class="flex items-center space-x-2">
                <button 
                  @click="sharePost(post)"
                  class="text-gray-500 hover:text-green-500 transition-colors"
                  title="分享这条帖子 - 让更多人看到这份情绪共鸣"
                >
                  <div class="i-mdi-share"></div>
                </button>
                
                <button 
                  @click="toggleReportPost(post)"
                  :disabled="reportingPosts.has(post.id)"
                  class="flex items-center space-x-1 transition-all duration-200"
                  :class="[
                    post.isReported ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500',
                    reportingPosts.has(post.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  ]"
                  :title="getReportButtonTitle(post)"
                >
                  <div 
                    v-if="reportingPosts.has(post.id)"
                    class="i-mdi-loading animate-spin text-sm" 
                  ></div>
                  <div 
                    v-else
                    :class="`i-mdi-${post.isReported ? 'flag' : 'flag-outline'} text-sm ${post.isReported ? 'text-red-500 animate-pulse' : 'hover:scale-110 transition-transform'}`"
                  ></div>
                  <span v-if="post.isReported" class="text-xs">
                    {{ post.reportedBy === currentUserId ? '已举报' : '被举报' }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredPosts.length === 0 && !isLoading" class="text-center py-12">
          <div class="i-mdi-emoticon-sad text-6xl text-gray-400 mx-auto mb-4"></div>
          <h3 class="text-xl font-medium text-gray-600 mb-2">暂无帖子</h3>
          <p class="text-gray-500">成为第一个发泄情绪的人吧！</p>
        </div>

        <div v-if="hasMorePosts && filteredPosts.length > 0" class="text-center py-8">
          <button
            @click="loadMorePosts"
            :disabled="isLoading"
            class="btn-primary flex items-center space-x-2 mx-auto"
          >
            <div v-if="isLoading" class="i-mdi-loading animate-spin"></div>
            <div v-else class="i-mdi-chevron-down"></div>
            <span>{{ isLoading ? '加载中...' : '加载更多' }}</span>
          </button>
        </div>

        <div v-if="isLoading && filteredPosts.length === 0" class="text-center py-12">
          <div class="i-mdi-loading text-4xl text-blue-500 animate-spin mx-auto mb-4"></div>
          <p class="text-gray-500">加载中...</p>
        </div>
      </div>
    </main>

        <!-- 页脚版权信息 -->
    <footer class="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- 项目信息 -->
          <div class="text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <div class="i-mdi-heart text-white text-sm"></div>
              </div>
              <h3 class="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                匿名情绪发泄站
              </h3>
            </div>
            <p class="text-gray-600 text-sm">
              一个安全、匿名的情绪发泄平台，让每个人都能自由表达内心感受
            </p>
          </div>

          <!-- 版权和归属信息 -->
          <div class="text-center md:text-right">
            <p class="text-gray-500 text-sm">
              © {{ new Date().getFullYear() }} 匿名情绪发泄站. 保留所有权利.
            </p>
            <p class="text-gray-400 text-xs mt-1">
              基于 <a href="https://nuxt.com/" target="_blank" class="text-blue-500 hover:text-blue-600">Nuxt 3</a> + 
              <a href="https://vuejs.org/" target="_blank" class="text-blue-500 hover:text-blue-600">Vue 3</a> + 
              <a href="https://unocss.dev/" target="_blank" class="text-blue-500 hover:text-blue-600">UnoCSS</a> 构建
            </p>
          </div>
        </div>
      </div>
    </footer>

    <CreatePostModal 
      v-if="showCreatePost"
      :initial-emotion="selectedEmotion || undefined"
      @close="showCreatePost = false"
      @created="onPostCreated"
    />

    <StatsModal 
      v-if="showStats"
      @close="showStats = false"
      :stats="emotionStats"
    />

    <CommentsModal 
      v-if="showCommentsModal"
      ref="commentsModalRef"
      :post="selectedPost"
      @close="showCommentsModal = false"
      @comment-added="onCommentAdded"
      @report-comment="handleCommentReport"
    />

    <ReportModal
      v-if="showReportModal && reportTarget"
      :type="reportTarget.type"
      :content="reportTarget.content"
      :is-reporting="reportTarget.isReporting"
      @close="closeReportModal"
      @confirm="handleReportConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// 使用UnoCSS图标系统，不再需要@iconify/vue
import type { EmotionPost, EmotionType } from '../types/emotion'
import CreatePostModal from '../components/CreatePostModal.vue'
import StatsModal from '../components/StatsModal.vue'
import CommentsModal from '../components/CommentsModal.vue'
import ReportModal from '../components/ReportModal.vue'

// SSR已在nuxt.config.ts中全局禁用

// 响应式数据
const showCreatePost = ref(false)
const showStats = ref(false)
const showCommentsModal = ref(false)
const showReportModal = ref(false)
const selectedEmotion = ref<EmotionType | null>(null)
const selectedPost = ref<EmotionPost | null>(null)
const reportTarget = ref<{
  type: 'post' | 'comment'
  id: string
  content: string
  isReporting: boolean
} | null>(null)
const posts = ref<EmotionPost[]>([])
const currentPage = ref(1)
const isLoading = ref(false)
const hasMorePosts = ref(true)
const postsPerPage = 20

// 生成简单的用户标识符（基于浏览器特征）
const generateUserId = (): string => {
  // 页面禁用SSR，安全访问浏览器API
  const stored = localStorage.getItem('emotion_user_id')
  if (stored) return stored
  
  // 生成基于浏览器特征的简单ID
  const features = [
    navigator.userAgent,
    screen.width,
    screen.height,
    navigator.language,
    new Date().getTimezoneOffset(),
  ].join('|')
  
  const hash = features.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const userId = 'user_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36).slice(-4)
  localStorage.setItem('emotion_user_id', userId)
  return userId
}

const currentUserId = ref('')

const emotionStats = ref({
  total: 0,
  byType: {
    happy: 0,
    sad: 0,
    angry: 0,
    anxious: 0,
    excited: 0,
    frustrated: 0,
    grateful: 0,
    neutral: 0
  } as Record<string, number>,
  recentActivity: 0,
  topTags: [] as { name: string; count: number }[],
  timeStats: {
    today: 0,
    week: 0,
    month: 0
  },
  uniqueUsers: 0,
  totalComments: 0,
  avgCommentsPerPost: 0
})

// 情绪配置
const emotions: { type: EmotionType; label: string; icon: string; description: string }[] = [
  { type: 'happy', label: '开心', icon: 'mdi:emoticon-happy', description: '感到快乐和满足' },
  { type: 'sad', label: '难过', icon: 'mdi:emoticon-sad', description: '感到悲伤和失落' },
  { type: 'angry', label: '愤怒', icon: 'mdi:emoticon-angry', description: '感到愤怒和不满' },
  { type: 'anxious', label: '焦虑', icon: 'mdi:emoticon-confused', description: '感到焦虑和担心' },
  { type: 'excited', label: '兴奋', icon: 'mdi:emoticon-excited', description: '感到兴奋和激动' },
  { type: 'frustrated', label: '沮丧', icon: 'mdi:emoticon-cry', description: '感到沮丧和挫败' },
  { type: 'grateful', label: '感恩', icon: 'mdi:emoticon-kiss', description: '感到感恩和满足' },
  { type: 'neutral', label: '平静', icon: 'mdi:emoticon-neutral', description: '感到平静和放松' }
]

// 计算属性 - 现在筛选在后端完成，这里直接返回posts
const filteredPosts = computed(() => {
  return posts.value || []
})

// 工具函数
const parsePostTags = (tags: any): string[] => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.warn('Failed to parse tags:', error)
      return []
    }
  }
  return []
}

// 方法
const selectEmotion = (emotion: EmotionType) => {
  selectedEmotion.value = emotion
  refreshPosts() // 重新加载帖子
}

const clearFilter = () => {
  selectedEmotion.value = null
  refreshPosts() // 重新加载帖子
}

const loadPosts = async (page: number = 1, append: boolean = false) => {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: postsPerPage.toString()
    })
    
    if (selectedEmotion.value) {
      params.append('emotion', selectedEmotion.value)
    }
    
    // 传递用户ID以获取点赞状态
    if (currentUserId.value) {
      params.append('userId', currentUserId.value)
    }
    
    const response = await $fetch<{
      posts: EmotionPost[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
      }
    }>(`/api/posts?${params}`)
    
    // 确保每个post都有comments数组和正确的tags格式
    const processedPosts = response.posts.map(post => ({
      ...post,
      comments: post.comments || [],
      tags: parsePostTags(post.tags)
    }))
    
    if (append) {
      posts.value.push(...processedPosts)
    } else {
      posts.value = processedPosts
    }
    
    hasMorePosts.value = response.pagination.hasNext
    currentPage.value = response.pagination.page
    
    if (page === 1) {
      updateStats()
    }
  } catch (error) {
    console.error('Failed to load posts:', error)
    if (!append) {
      posts.value = []
    }
  } finally {
    isLoading.value = false
  }
}

const refreshPosts = async () => {
  currentPage.value = 1
  hasMorePosts.value = true
  await loadPosts(1, false)
}

const loadMorePosts = async () => {
  if (hasMorePosts.value && !isLoading.value) {
    await loadPosts(currentPage.value + 1, true)
  }
}

// 点赞状态锁，防止重复请求
const likingPosts = ref(new Set<string>())
const reportingPosts = ref(new Set<string>())
const reportingComments = ref(new Set<string>())
const commentsModalRef = ref()

const likePost = async (postId: string) => {
  if (!currentUserId.value) {
    alert('请稍后重试，用户信息加载中...')
    return
  }
  
  // 防止重复点击
  if (likingPosts.value.has(postId)) {
    console.log('点赞请求进行中，请稍候...')
    return
  }
  
  try {
    // 锁定这个帖子的点赞状态
    likingPosts.value.add(postId)
    
    const result = await $fetch<EmotionPost>(`/api/posts/${postId}/like`, { 
      method: 'POST',
      body: { userId: currentUserId.value }
    })
    
    // 更新本地状态
    const post = posts.value.find((p: EmotionPost) => p.id === postId)
    if (post) {
      post.likes = result.likes
      post.liked = result.liked
    }
  } catch (error: any) {
    console.error('点赞失败:', error)
    
    // 处理重复点赞错误
    if (error.statusCode === 409) {
      console.log('检测到重复点赞，刷新帖子状态')
      // 重新获取这个帖子的最新状态
      await refreshPosts()
    } else {
      alert('点赞失败，请重试')
    }
  } finally {
    // 释放锁定状态
    likingPosts.value.delete(postId)
  }
}

const showComments = (postId: string) => {
  selectedPost.value = posts.value.find((p: EmotionPost) => p.id === postId) || null
  showCommentsModal.value = true
}

const sharePost = (post: EmotionPost) => {
  // 实现分享功能
  if (navigator.share) {
    navigator.share({
      title: '匿名情绪发泄站',
      text: post.content.substring(0, 100) + '...',
      url: window.location.href
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(post.content)
    alert('内容已复制到剪贴板')
  }
}

const getReportButtonTitle = (post: EmotionPost): string => {
  if (reportingPosts.value.has(post.id)) {
    return '处理中...'
  }
  
  if (!post.isReported) {
    return '举报不当内容 - 帮助维护社区环境'
  }
  
  if (post.reportedBy === currentUserId.value) {
    return '已举报 - 点击取消举报'
  }
  
  return '此内容已被其他用户举报'
}

const toggleReportPost = (post: EmotionPost) => {
  // 防止重复操作
  if (reportingPosts.value.has(post.id)) {
    return
  }
  
  // 如果内容已被举报，且不是当前用户举报的，则不允许操作
  if (post.isReported && post.reportedBy !== currentUserId.value) {
    alert('此内容已被其他用户举报，您无法取消他人的举报')
    return
  }
  
  reportTarget.value = {
    type: 'post',
    id: post.id,
    content: post.content,
    isReporting: !post.isReported
  }
  showReportModal.value = true
}

const closeReportModal = () => {
  showReportModal.value = false
  reportTarget.value = null
}

const handleReportConfirm = async (reason?: string) => {
  if (!reportTarget.value) return
  
  const { type, id, isReporting } = reportTarget.value
  const action = isReporting ? '举报' : '取消举报'
  
  // 添加到处理中状态，防止重复操作
  if (type === 'post') {
    reportingPosts.value.add(id)
  } else {
    reportingComments.value.add(id)
  }
  
  try {
    if (type === 'post') {
      const endpoint = isReporting ? `/api/posts/${id}/report` : `/api/posts/${id}/unreport`
      const body = isReporting 
        ? { reason, userId: currentUserId.value }
        : { userId: currentUserId.value }
      
      await $fetch(endpoint, { 
        method: 'POST',
        body 
      })
      
      // 更新本地状态
      const post = posts.value.find(p => p.id === id)
      if (post) {
        post.isReported = isReporting
        post.reportedBy = isReporting ? currentUserId.value : null
      }
    } else {
      // 处理评论举报
      const endpoint = isReporting ? `/api/comments/${id}/report` : `/api/comments/${id}/unreport`
      const body = isReporting 
        ? { reason, userId: currentUserId.value }
        : { userId: currentUserId.value }
      
      await $fetch(endpoint, { 
        method: 'POST',
        body 
      })
      
      // 更新本地状态
      if (selectedPost.value?.comments) {
        const comment = selectedPost.value.comments.find(c => c.id === id)
        if (comment) {
          comment.isReported = isReporting
          comment.reportedBy = isReporting ? currentUserId.value : null
        }
      }
    }
    
    closeReportModal()
    alert(`${action}成功${isReporting ? '，感谢您的反馈！' : '！'}`)
    
  } catch (error) {
    console.error(`Failed to ${action}:`, error)
    alert(`${action}失败，请稍后重试`)
  } finally {
    // 移除处理中状态
    if (type === 'post') {
      reportingPosts.value.delete(id)
    } else {
      reportingComments.value.delete(id)
      // 同时清理CommentsModal中的状态
      if (commentsModalRef.value) {
        commentsModalRef.value.clearReportingState(id)
      }
    }
  }
}

const onPostCreated = async (newPost: EmotionPost) => {
  try {
    const created = await $fetch<EmotionPost>('/api/posts', {
      method: 'POST',
      body: {
        content: newPost.content,
        emotion: newPost.emotion,
        isAnonymous: newPost.isAnonymous,
        tags: newPost.tags ?? [],
        userId: currentUserId.value, // 传递用户ID
        author: newPost.author, // 传递作者名称
      },
    })
    // 确保新创建的post有comments数组和正确的tags格式
    const postWithComments = {
      ...created,
      comments: created.comments || [],
      tags: parsePostTags(created.tags)
    }
    posts.value.unshift(postWithComments)
    showCreatePost.value = false
    updateStats()
  } catch (error) {
    console.error('Failed to create post:', error)
    alert('发布失败，请重试')
  }
}

const onCommentAdded = async (postId: string) => {
  // 评论已经在CommentsModal中添加到了post.comments
  // 这里只需要更新统计数据，不需要重复创建评论

  try {
    // 更新统计数据
    updateStats()
  } catch (error) {
    console.error('Failed to update stats:', error)
  }
}

const handleCommentReport = (reportData: any) => {
  reportTarget.value = reportData
  showReportModal.value = true
}

const initializePosts = async () => {
  await loadPosts(1, false)
}

const updateStats = async () => {
  try {
    const stats = await $fetch('/api/stats')
    emotionStats.value = {
      total: stats.total,
      byType: stats.byType,
      recentActivity: stats.recentActivity,
      topTags: stats.topTags || [],
      timeStats: stats.timeStats || { today: 0, week: 0, month: 0 },
      uniqueUsers: stats.uniqueUsers || 0,
      totalComments: stats.totalComments || 0,
      avgCommentsPerPost: stats.avgCommentsPerPost || 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 如果API失败，使用本地计算作为备用
    emotionStats.value.total = posts.value.length
    emotionStats.value.recentActivity = posts.value.filter((p: EmotionPost) => 
      Date.now() - new Date(p.timestamp).getTime() < 24 * 60 * 60 * 1000
    ).length
    
    // 重置计数
    Object.keys(emotionStats.value.byType).forEach(key => {
      emotionStats.value.byType[key as EmotionType] = 0
    })
    
    // 统计各类型数量
    posts.value.forEach((post: EmotionPost) => {
      if (post.emotion && emotionStats.value.byType.hasOwnProperty(post.emotion)) {
        emotionStats.value.byType[post.emotion] = (emotionStats.value.byType[post.emotion] || 0) + 1
      }
    })
  }
}

const getEmotionLabel = (emotion: EmotionType): string => {
  const found = emotions.find(e => e.type === emotion)
  return found ? found.label : emotion
}

const getEmotionIcon = (emotion: EmotionType): string => {
  const found = emotions.find(e => e.type === emotion)
  return found ? found.icon : 'mdi:emoticon-neutral'
}

const formatTime = (timestamp: Date | string): string => {
  const now = new Date()
  const timeObj = timestamp instanceof Date ? timestamp : new Date(timestamp)
  const diff = now.getTime() - timeObj.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return timeObj.toLocaleDateString()
}

// SEO配置
useHead({
  title: '匿名情绪发泄站 - 安全匿名情绪发泄平台',
  meta: [
    { name: 'description', content: '匿名情绪发泄站是一个完全安全的匿名情绪发泄平台，支持8种情绪状态，让每个人都能自由表达内心感受，释放压力，获得心理支持。' },
    { name: 'keywords', content: '情绪发泄,匿名发泄,心理支持,情绪管理,压力释放,心理健康,匿名平台,情绪表达,心理疏导,情感宣泄' },
    { property: 'og:title', content: '匿名情绪发泄站 - 安全匿名情绪发泄平台' },
    { property: 'og:description', content: '匿名情绪发泄站是一个完全安全的匿名情绪发泄平台，支持8种情绪状态，让每个人都能自由表达内心感受，释放压力，获得心理支持。' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://mood.hb0730.me/' },
    { property: 'og:image', content: 'https://mood.hb0730.me/og-image.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: '匿名情绪发泄站 - 安全匿名情绪发泄平台' },
    { name: 'twitter:description', content: '匿名情绪发泄站是一个完全安全的匿名情绪发泄平台，支持8种情绪状态，让每个人都能自由表达内心感受，释放压力，获得心理支持。' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "匿名情绪发泄站",
        "description": "一个安全的匿名情绪发泄平台",
        "url": "https://mood.hb0730.me/",
        "mainEntity": {
          "@type": "WebSite",
          "name": "匿名情绪发泄站",
          "description": "支持8种情绪状态的匿名发泄平台"
        }
      })
    }
  ]
})

// 生命周期
onMounted(async () => {
  currentUserId.value = generateUserId()
  await initializePosts()
})
</script>
