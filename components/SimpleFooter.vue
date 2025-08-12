<template>
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
          
          <!-- 统计信息 (可选) -->
          <div v-if="showUserCount || showAdminBadge" class="flex items-center justify-center md:justify-end space-x-6 text-sm text-gray-500 mt-4">
            <span v-if="showUserCount" class="flex items-center space-x-1">
              <div class="i-mdi-account-group text-gray-400"></div>
              <span>用户数: {{ userCount }}</span>
            </span>
            <span v-if="showAdminBadge" class="flex items-center space-x-1">
              <div class="i-mdi-shield-account text-gray-400"></div>
              <span>管理后台</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
interface Props {
  showUserCount?: boolean
  userCount?: number
  showAdminBadge?: boolean
  variant?: 'default' | 'admin'
}

const props = withDefaults(defineProps<Props>(), {
  showUserCount: false,
  userCount: 0,
  showAdminBadge: false,
  variant: 'default'
})

// 根据variant自动设置显示内容
const computedShowUserCount = computed(() => 
  props.variant === 'default' ? props.showUserCount : false
)

const computedShowAdminBadge = computed(() => 
  props.variant === 'admin' ? true : false
)
</script>

<style scoped>
/* 可以根据需要添加自定义样式 */
</style>
