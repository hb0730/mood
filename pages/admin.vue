<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">

    <!-- 头部导航 -->
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="i-mdi-shield-account text-3xl text-red-600 mr-3"></div>
            <h1 class="text-xl font-bold text-gray-900">内容管理后台</h1>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink to="/" class="text-gray-600 hover:text-gray-900 transition-colors">
              <div class="i-mdi-home text-xl"></div>
              <span class="ml-1">返回首页</span>
            </NuxtLink>
            <button
              @click="logout"
              class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 登录表单 -->
    <div v-if="!isAuthenticated" class="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div class="text-center mb-6">
          <div class="i-mdi-lock text-4xl text-gray-600 mx-auto mb-2"></div>
          <h2 class="text-2xl font-bold text-gray-900">管理员登录</h2>
          <p class="text-gray-600">请输入管理员密码</p>
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="请输入管理员密码"
            />
          </div>
          
          <div v-if="loginError" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ loginError }}
          </div>
          
          <button
            type="submit"
            :disabled="!password || isLoggingIn"
            class="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div v-if="isLoggingIn" class="i-mdi-loading animate-spin mr-2"></div>
            {{ isLoggingIn ? '登录中...' : '登录' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 管理界面 -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 统计概览 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100">
              <div class="i-mdi-text-box text-2xl text-blue-600"></div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">总帖子数</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
              <p class="text-xs text-gray-500">活跃: {{ stats.active }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100">
              <div class="i-mdi-flag text-2xl text-red-600"></div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">被举报</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.reported }}</p>
              <p class="text-xs text-gray-500">待处理: {{ stats.pendingReports }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100">
              <div class="i-mdi-eye-off text-2xl text-yellow-600"></div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">已隐藏</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.hidden }}</p>
              <p class="text-xs text-gray-500">可恢复: {{ stats.hidden }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100">
              <div class="i-mdi-calendar-today text-2xl text-green-600"></div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">今日新增</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.today }}</p>
              <p class="text-xs text-gray-500">评论: {{ stats.todayComments }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 额外统计信息 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">情绪分布</h4>
          <div class="space-y-2">
            <div v-for="(emotion, key) in stats.emotionStats" :key="key" class="flex justify-between items-center">
              <span class="text-sm text-gray-600">{{ getEmotionLabel(key) }}</span>
              <div class="flex items-center">
                <div class="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full" 
                    :style="{ width: `${(emotion / stats.total) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ emotion }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">活跃度趋势</h4>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">昨日</span>
              <span class="text-sm font-medium">{{ stats.yesterday || 0 }} 篇</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">本周</span>
              <span class="text-sm font-medium">{{ stats.thisWeek || 0 }} 篇</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">本月</span>
              <span class="text-sm font-medium">{{ stats.thisMonth || 0 }} 篇</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">平均日发布</span>
              <span class="text-sm font-medium">{{ stats.dailyAverage || 0 }} 篇</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">系统状态</h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">数据库状态</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div class="i-mdi-check-circle mr-1"></div>
                正常
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">存储使用</span>
              <span class="text-sm font-medium text-gray-900">{{ stats.storageUsed || '未知' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">最后更新</span>
              <span class="text-sm text-gray-500">{{ formatTime(new Date()) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选和快速操作选项 -->
      <div class="bg-white rounded-lg shadow mb-6 p-6">
        <div class="flex flex-wrap items-center gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">筛选状态</label>
            <select
              v-model="selectedFilter"
              @change="loadPosts"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">全部帖子</option>
              <option value="reported">被举报</option>
              <option value="hidden">已隐藏</option>
              <option value="normal">正常显示</option>
              <option value="pending">待处理举报</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">情绪类型</label>
            <select
              v-model="selectedEmotion"
              @change="loadPosts"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">全部情绪</option>
              <option value="happy">开心</option>
              <option value="sad">难过</option>
              <option value="angry">愤怒</option>
              <option value="anxious">焦虑</option>
              <option value="excited">兴奋</option>
              <option value="frustrated">沮丧</option>
              <option value="grateful">感恩</option>
              <option value="neutral">平静</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
            <select
              v-model="sortBy"
              @change="loadPosts"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="newest">最新发布</option>
              <option value="oldest">最早发布</option>
              <option value="most_reported">举报最多</option>
              <option value="most_liked">点赞最多</option>
              <option value="most_comments">评论最多</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">时间范围</label>
            <select
              v-model="timeRange"
              @change="loadPosts"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">全部时间</option>
              <option value="today">今天</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
            </select>
          </div>
        </div>

        <!-- 快速操作 -->
        <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
          <button
            @click="loadPosts"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <div class="i-mdi-refresh mr-2"></div>
            刷新
          </button>
          
          <button
            @click="exportData"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <div class="i-mdi-download mr-2"></div>
            导出数据
          </button>
          
          <button
            @click="batchHideReported"
            :disabled="stats.reported === 0"
            class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="i-mdi-eye-off mr-2"></div>
            批量隐藏举报
          </button>
          
          <button
            @click="cleanupOldPosts"
            class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <div class="i-mdi-broom mr-2"></div>
            清理旧数据
          </button>
          
          <div class="ml-auto text-sm text-gray-500">
            共 {{ pagination.total }} 条记录
          </div>
        </div>
      </div>

      <!-- 帖子列表 -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">帖子管理</h3>
        </div>
        
        <div v-if="isLoading" class="p-8 text-center">
          <div class="i-mdi-loading text-4xl text-gray-400 animate-spin mx-auto mb-4"></div>
          <p class="text-gray-500">加载中...</p>
        </div>
        
        <div v-else-if="posts.length === 0" class="p-8 text-center">
          <div class="i-mdi-inbox text-4xl text-gray-400 mx-auto mb-4"></div>
          <p class="text-gray-500">暂无帖子</p>
        </div>
        
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="post in posts"
            :key="post.id"
            class="p-6 hover:bg-gray-50 transition-colors"
            :class="{
              'bg-red-50': post.isReported,
              'bg-yellow-50': post.isHidden
            }"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <!-- 帖子信息 -->
                <div class="flex items-center space-x-2 mb-2">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getEmotionClass(post.emotion)"
                  >
                    {{ getEmotionLabel(post.emotion) }}
                  </span>
                  
                  <span class="text-sm text-gray-500">
                    {{ formatTime(post.timestamp) }}
                  </span>
                  
                  <span
                    v-if="post.isReported && !post.isHidden"
                    class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center"
                  >
                    <div class="i-mdi-flag mr-1"></div>
                    待处理举报
                  </span>
                  
                  <span
                    v-if="post.isReported && post.isHidden"
                    class="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center"
                  >
                    <div class="i-mdi-flag mr-1"></div>
                    已处理举报
                  </span>
                  
                  <span
                    v-if="post.isHidden && !post.isReported"
                    class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center"
                  >
                    <div class="i-mdi-eye-off mr-1"></div>
                    管理员隐藏
                  </span>
                </div>
                
                <!-- 帖子内容 -->
                <p class="text-gray-900 mb-2">{{ post.content }}</p>
                
                <!-- 标签 -->
                <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
                  <span
                    v-for="tag in post.tags"
                    :key="tag"
                    class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    #{{ tag }}
                  </span>
                </div>
                
                <!-- 统计信息 -->
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span class="flex items-center">
                    <div class="i-mdi-heart mr-1"></div>
                    {{ post.likes }} 赞
                  </span>
                  <span class="flex items-center">
                    <div class="i-mdi-comment mr-1"></div>
                    {{ post.comments?.length || 0 }} 评论
                  </span>
                  <span v-if="post.userId" class="flex items-center">
                    <div class="i-mdi-account mr-1"></div>
                    用户ID: {{ post.userId.slice(-8) }}
                  </span>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="flex flex-col space-y-2 ml-4">
                <!-- 举报状态管理 -->
                <button
                  v-if="post.isReported"
                  @click="unreportPost(post.id)"
                  class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                  title="取消举报，恢复为正常帖子"
                >
                  <div class="i-mdi-flag-remove mr-1 text-xs"></div>
                  撤销举报
                </button>
                
                <!-- 显示/隐藏管理 -->
                <button
                  v-if="!post.isHidden"
                  @click="hidePost(post.id)"
                  class="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                >
                  隐藏
                </button>
                <button
                  v-else
                  @click="showPost(post.id)"
                  class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  恢复显示
                </button>
                
                <!-- 永久删除 -->
                <button
                  @click="deletePost(post.id)"
                  class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  删除
                </button>
                
                <!-- 查看评论 -->
                <button
                  @click="viewComments(post)"
                  class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  评论
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div class="text-sm text-gray-700">
            显示第 {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 条，共 {{ pagination.total }} 条
          </div>
          
          <div class="flex space-x-2">
            <button
              @click="loadPage(pagination.page - 1)"
              :disabled="!pagination.hasPrev"
              class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              @click="loadPage(pagination.page + 1)"
              :disabled="!pagination.hasNext"
              class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论模态框 -->
    <div v-if="showCommentsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-medium">评论管理</h3>
          <button @click="showCommentsModal = false" class="text-gray-400 hover:text-gray-600">
            <div class="i-mdi-close text-xl"></div>
          </button>
        </div>
        
        <div class="p-4 max-h-96 overflow-y-auto">
          <div v-if="selectedPost?.comments?.length === 0" class="text-center py-8 text-gray-500">
            暂无评论
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="comment in selectedPost?.comments"
              :key="comment.id"
              class="border border-gray-200 rounded p-3"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <p class="text-gray-900 mb-1">{{ comment.content }}</p>
                  <p class="text-sm text-gray-500">{{ formatTime(comment.timestamp) }}</p>
                </div>
                <button
                  @click="deleteComment(comment.id)"
                  class="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors ml-2"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚版权信息 -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div class="text-center md:text-left">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 页面元数据
definePageMeta({
  layout: false,
  ssr: false  // 管理页面禁用SSR
})

// 响应式数据
const isAuthenticated = ref(false)
const password = ref('')
const loginError = ref('')
const isLoggingIn = ref(false)
const isLoading = ref(false)
const posts = ref<any[]>([])
const selectedFilter = ref('all')
const selectedEmotion = ref('all')
const timeRange = ref('all')
const sortBy = ref('newest')
const currentPage = ref(1)
const showCommentsModal = ref(false)
const selectedPost = ref<any>(null)

const stats = ref({
  total: 0,
  active: 0,
  reported: 0,
  pendingReports: 0,
  hidden: 0,
  today: 0,
  todayComments: 0,
  yesterday: 0,
  thisWeek: 0,
  thisMonth: 0,
  dailyAverage: 0,
  emotionStats: {},
  storageUsed: '未知'
})

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
})

// 情绪配置
const emotionConfig = {
  happy: { label: '开心', class: 'bg-green-100 text-green-800' },
  sad: { label: '难过', class: 'bg-blue-100 text-blue-800' },
  angry: { label: '愤怒', class: 'bg-red-100 text-red-800' },
  anxious: { label: '焦虑', class: 'bg-yellow-100 text-yellow-800' },
  excited: { label: '兴奋', class: 'bg-pink-100 text-pink-800' },
  frustrated: { label: '沮丧', class: 'bg-gray-100 text-gray-800' },
  grateful: { label: '感恩', class: 'bg-purple-100 text-purple-800' },
  neutral: { label: '平静', class: 'bg-indigo-100 text-indigo-800' }
}

// 方法
const handleLogin = async () => {
  isLoggingIn.value = true
  loginError.value = ''
  
  try {
    const response = await $fetch('/api/admin/login', {
      method: 'POST',
      body: { password: password.value }
    })
    
    if (response.success) {
      isAuthenticated.value = true
      localStorage.setItem('admin_token', response.token)
      await loadStats()
      await loadPosts()
    }
  } catch (error: any) {
    loginError.value = error.data?.message || '登录失败'
  } finally {
    isLoggingIn.value = false
  }
}

const logout = () => {
  isAuthenticated.value = false
  localStorage.removeItem('admin_token')
  password.value = ''
}

const loadStats = async () => {
  try {
    const data = await $fetch('/api/admin/stats', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    stats.value = data
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const loadPosts = async () => {
  isLoading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: pagination.value.limit.toString(),
      filter: selectedFilter.value,
      emotion: selectedEmotion.value,
      timeRange: timeRange.value,
      sort: sortBy.value
    })
    
    const response = await $fetch(`/api/admin/posts?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    
    posts.value = response.posts
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load posts:', error)
    alert('加载帖子失败，请检查网络连接或重新登录')
  } finally {
    isLoading.value = false
  }
}

const loadPage = (page: number) => {
  currentPage.value = page
  loadPosts()
}

const hidePost = async (postId: string) => {
  try {
    await $fetch(`/api/admin/posts/${postId}/hide`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    await loadPosts()
    await loadStats()
  } catch (error) {
    console.error('Failed to hide post:', error)
    alert('操作失败')
  }
}

const showPost = async (postId: string) => {
  try {
    await $fetch(`/api/admin/posts/${postId}/show`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    await loadPosts()
    await loadStats()
  } catch (error) {
    console.error('Failed to show post:', error)
    alert('操作失败')
  }
}

const unreportPost = async (postId: string) => {
  if (!confirm('确定要撤销举报状态，将此帖子恢复为正常帖子吗？')) {
    return
  }
  
  try {
    await $fetch(`/api/admin/posts/${postId}/unreport`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    await loadPosts()
    await loadStats()
    alert('举报状态已撤销，帖子已恢复正常')
  } catch (error) {
    console.error('Failed to unreport post:', error)
    alert('撤销举报失败')
  }
}

const deletePost = async (postId: string) => {
  if (!confirm('确定要删除这个帖子吗？此操作不可撤销。')) {
    return
  }
  
  try {
    await $fetch(`/api/admin/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    await loadPosts()
    await loadStats()
  } catch (error) {
    console.error('Failed to delete post:', error)
    alert('删除失败')
  }
}

const viewComments = (post: any) => {
  selectedPost.value = post
  showCommentsModal.value = true
}

const deleteComment = async (commentId: string) => {
  if (!confirm('确定要删除这个评论吗？')) {
    return
  }
  
  try {
    await $fetch(`/api/admin/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    await loadPosts()
    showCommentsModal.value = false
  } catch (error) {
    console.error('Failed to delete comment:', error)
    alert('删除失败')
  }
}

const getEmotionLabel = (emotion: string) => {
  return emotionConfig[emotion as keyof typeof emotionConfig]?.label || emotion
}

const getEmotionClass = (emotion: string) => {
  return emotionConfig[emotion as keyof typeof emotionConfig]?.class || 'bg-gray-100 text-gray-800'
}

const formatTime = (timestamp: Date | string) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

// 新增管理功能
const exportData = async () => {
  try {
    const response = await $fetch('/api/admin/export', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: {
        filter: selectedFilter.value,
        emotion: selectedEmotion.value,
        timeRange: timeRange.value
      }
    })
    
    // 创建下载链接
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `posts_export_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
    
    alert('数据导出成功!')
  } catch (error) {
    console.error('Failed to export data:', error)
    alert('导出失败')
  }
}

const batchHideReported = async () => {
  if (!confirm('确定要批量隐藏所有被举报的帖子吗？')) {
    return
  }
  
  try {
    await $fetch('/api/admin/batch/hide-reported', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
    
    await loadPosts()
    await loadStats()
    alert('批量隐藏操作完成')
  } catch (error) {
    console.error('Failed to batch hide reported posts:', error)
    alert('批量隐藏失败')
  }
}

const cleanupOldPosts = async () => {
  const days = prompt('请输入要删除多少天前的帖子（建议30天以上）:', '90')
  if (!days || parseInt(days) < 30) {
    alert('为了安全，只能删除30天以上的帖子')
    return
  }
  
  if (!confirm(`确定要删除${days}天前的所有帖子吗？此操作不可撤销！`)) {
    return
  }
  
  try {
    const response = await $fetch('/api/admin/cleanup', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: { days: parseInt(days) }
    })
    
    await loadPosts()
    await loadStats()
    alert(`清理完成，删除了 ${response.deletedCount} 个帖子`)
  } catch (error) {
    console.error('Failed to cleanup old posts:', error)
    alert('清理失败')
  }
}

// SEO配置
useHead({
  title: '内容管理后台 - 匿名情绪发泄站',
  meta: [
    { name: 'description', content: '匿名情绪发泄站内容管理后台，提供内容审核、举报处理、数据统计等管理功能。' },
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'googlebot', content: 'noindex, nofollow' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "内容管理后台",
        "description": "匿名情绪发泄站管理后台",
        "url": "https://your-domain.com/admin",
        "isPartOf": {
          "@type": "WebSite",
          "name": "匿名情绪发泄站"
        }
      })
    }
  ]
})

// 生命周期
onMounted(() => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    isAuthenticated.value = true
    loadStats()
    loadPosts()
  }
})
</script>
