<template>
  <div class="fixed inset-0 flex items-center justify-center p-4 modal-overlay" data-modal="true">
    <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col modal-content">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100 modal-header flex-shrink-0">
        <h2 class="text-2xl font-bold text-gray-900">情绪统计</h2>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <div class="i-mdi-close text-2xl"></div>
        </button>
      </div>

      <!-- 统计内容 -->
      <div class="modal-body scrollable flex-1 overflow-y-auto">
        <div class="p-6 space-y-8">
        <!-- 总体统计 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <div class="i-mdi-post text-white text-2xl"></div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ stats.total }}</h3>
            <p class="text-gray-600">总帖子数</p>
          </div>
          
          <div class="card text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <div class="i-mdi-trending-up text-white text-2xl"></div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ stats.recentActivity }}</h3>
            <p class="text-gray-600">24小时活跃</p>
          </div>
          
          <div class="card text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <div class="i-mdi-users text-white text-2xl"></div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ getUniqueUsers() }}</h3>
            <p class="text-gray-600">活跃用户</p>
          </div>

          <div class="card text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <div class="i-mdi-comment-multiple text-white text-2xl"></div>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ stats.totalComments || 0 }}</h3>
            <p class="text-gray-600">总评论数</p>
          </div>
        </div>

        <!-- 情绪分布 -->
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">情绪分布</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-for="(count, emotion) in stats.byType"
              :key="emotion"
              class="card text-center hover:shadow-lg transition-shadow cursor-pointer"
              @click="selectEmotion(emotion)"
            >
              <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                   :class="getEmotionColor(emotion)">
                <div :class="`i-${getEmotionIcon(emotion).replace(':', '-')} text-white text-xl`"></div>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 mb-1">{{ getEmotionLabel(emotion) }}</h4>
              <p class="text-2xl font-bold text-blue-600">{{ count }}</p>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getEmotionColor(emotion)"
                  :style="{ width: getPercentage(count) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 热门标签 -->
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">热门标签</h3>
          <div v-if="getTopTags().length > 0" class="flex flex-wrap gap-2">
            <span
              v-for="tag in getTopTags()"
              :key="tag.name"
              class="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              #{{ tag.name }} ({{ tag.count }})
            </span>
          </div>
          <div v-else class="text-center py-6 text-gray-500">
            暂无标签数据
          </div>
        </div>

        <!-- 时间趋势 -->
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">发布趋势</h3>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div class="text-2xl font-bold text-blue-600">{{ getTodayCount() }}</div>
                <div class="text-sm text-gray-600">今天</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-600">{{ getWeekCount() }}</div>
                <div class="text-sm text-gray-600">本周</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-purple-600">{{ getMonthCount() }}</div>
                <div class="text-sm text-gray-600">本月</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-orange-600">{{ stats.avgCommentsPerPost || 0 }}</div>
                <div class="text-sm text-gray-600">平均评论</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="flex justify-end p-6 border-t border-gray-100 flex-shrink-0">
        <button
          @click="$emit('close')"
          class="btn-primary"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EmotionStats, EmotionType } from '../types/emotion'

// 定义props
interface Props {
  stats: EmotionStats & {
    topTags?: { name: string; count: number }[]
    timeStats?: { today: number; week: number; month: number }
    uniqueUsers?: number
    totalComments?: number
    avgCommentsPerPost?: number
  }
}

const props = defineProps<Props>()

// 定义事件
const emit = defineEmits<{
  close: []
}>()

// 情绪配置
const emotionConfig = {
  happy: { label: '开心', icon: 'mdi:emoticon-happy', color: 'bg-green-500' },
  sad: { label: '难过', icon: 'mdi:emoticon-sad', color: 'bg-blue-500' },
  angry: { label: '愤怒', icon: 'mdi:emoticon-angry', color: 'bg-red-500' },
  anxious: { label: '焦虑', icon: 'mdi:emoticon-confused', color: 'bg-yellow-500' },
  excited: { label: '兴奋', icon: 'mdi:emoticon-excited', color: 'bg-pink-500' },
  frustrated: { label: '沮丧', icon: 'mdi:emoticon-cry', color: 'bg-gray-500' },
  grateful: { label: '感恩', icon: 'mdi:emoticon-kiss', color: 'bg-purple-500' },
  neutral: { label: '平静', icon: 'mdi:emoticon-neutral', color: 'bg-indigo-500' }
}

// 方法
const getEmotionLabel = (emotion: EmotionType): string => {
  return emotionConfig[emotion]?.label || emotion
}

const getEmotionIcon = (emotion: EmotionType): string => {
  return emotionConfig[emotion]?.icon || 'mdi:emoticon-neutral'
}

const getEmotionColor = (emotion: EmotionType): string => {
  return emotionConfig[emotion]?.color || 'bg-gray-500'
}

const getPercentage = (count: number): number => {
  if (props.stats.total === 0) return 0
  return Math.round((count / props.stats.total) * 100)
}

const getUniqueUsers = (): number => {
  return props.stats.uniqueUsers || Math.max(1, Math.floor(props.stats.total * 0.3))
}

const getTopTags = () => {
  return props.stats.topTags || []
}

const getTodayCount = (): number => {
  return props.stats.timeStats?.today || 0
}

const getWeekCount = (): number => {
  return props.stats.timeStats?.week || 0
}

const getMonthCount = (): number => {
  return props.stats.timeStats?.month || 0
}

const selectEmotion = (emotion: EmotionType) => {
  // 这里可以触发筛选事件
  console.log('选择情绪:', emotion)
}
</script>
