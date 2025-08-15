<template>
  <div class="fixed inset-0 flex items-center justify-center p-4 modal-overlay" data-modal="true">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full modal-content">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100 modal-header flex-shrink-0">
        <h2 class="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <div 
            :class="`i-mdi-${isReporting ? 'flag' : 'flag-remove'} ${isReporting ? 'text-red-500' : 'text-green-500'}`"
          ></div>
          <span>{{ isReporting ? $t('modals.report.reportTitle') : $t('modals.report.cancelReportTitle') }}</span>
        </h2>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <div class="i-mdi-close text-xl"></div>
        </button>
      </div>

      <!-- 主要内容 -->
      <div class="p-6 space-y-4">
        <!-- 内容预览 -->
        <div class="bg-gray-50 rounded-lg p-4 border">
          <div class="flex items-start space-x-3">
            <div 
              :class="`i-mdi-${type === 'post' ? 'text-box' : 'comment'} text-gray-500 mt-1 flex-shrink-0`"
            ></div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-700 mb-1">
                {{ type === 'post' ? $t('modals.report.postContent') : $t('modals.report.commentContent') }}
              </p>
              <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {{ content }}
              </p>
            </div>
          </div>
        </div>

        <!-- 举报说明 -->
        <div v-if="isReporting" class="space-y-3">
          <div class="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div class="i-mdi-information text-blue-500 mt-0.5 flex-shrink-0"></div>
            <div class="text-sm text-blue-700">
              <p class="font-medium mb-1">{{ $t('modals.report.reportNotice') }}</p>
              <ul class="space-y-1 text-xs">
                <li>• {{ $t('modals.report.reportNotice1') }}</li>
                <li>• {{ $t('modals.report.reportNotice2') }}</li>
                <li>• {{ $t('modals.report.reportNotice3') }}</li>
              </ul>
            </div>
          </div>
          
          <!-- 举报原因选择 -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              {{ $t('modals.report.reportReason') }} <span class="text-gray-400">{{ $t('modals.report.reportReasonOptional') }}</span>
            </label>
            <select 
              v-model="reportReason" 
              class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{{ $t('modals.report.selectReason') }}</option>
              <option value="spam">{{ $t('modals.report.spam') }}</option>
              <option value="harassment">{{ $t('modals.report.harassment') }}</option>
              <option value="inappropriate">{{ $t('modals.report.inappropriate') }}</option>
              <option value="misinformation">{{ $t('modals.report.misinformation') }}</option>
              <option value="other">{{ $t('modals.report.other') }}</option>
            </select>
          </div>
        </div>

        <!-- 取消举报说明 -->
        <div v-else class="p-4 bg-green-50 rounded-lg border border-green-200">
          <div class="flex items-start space-x-3">
            <div class="i-mdi-check-circle text-green-500 mt-0.5 flex-shrink-0"></div>
            <div class="text-sm text-green-700">
              <p class="font-medium mb-1">{{ $t('modals.report.cancelReport') }}</p>
              <p>{{ $t('modals.report.cancelReportDesc') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="flex justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors duration-200"
        >
          {{ $t('modals.report.cancel') }}
        </button>
        <button
          @click="handleConfirm"
          :disabled="isLoading"
          :class="[
            'flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200',
            isReporting
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
              : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg',
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          ]"
        >
          <div 
            v-if="isLoading"
            class="i-mdi-loading animate-spin"
          ></div>
          <div 
            v-else
            :class="`i-mdi-${isReporting ? 'flag' : 'flag-remove'}`"
          ></div>
                          <span>{{ isLoading ? $t('messages.loading') : (isReporting ? $t('modals.report.confirm') : $t('modals.report.cancelReport')) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  type: 'post' | 'comment'
  content: string
  isReporting: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm', reason?: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const reportReason = ref('')
const isLoading = ref(false)

const handleConfirm = async () => {
  isLoading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟API调用延迟
    emit('confirm', props.isReporting ? reportReason.value : undefined)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
