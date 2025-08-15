<template>
  <div class="fixed inset-0 flex items-center justify-center p-4 modal-overlay" data-modal="true">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden modal-content">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100 modal-header">
        <h2 class="text-2xl font-bold text-gray-900">
          <span v-if="props.initialEmotion">{{ $t('modals.createPost.titleWithEmotion', { emotion: getEmotionLabel(props.initialEmotion) }) }}</span>
          <span v-else>{{ $t('modals.createPost.title') }}</span>
        </h2>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <div class="i-mdi-close text-2xl"></div>
        </button>
      </div>

      <!-- 表单内容 -->
      <div class="modal-body scrollable">
        <form @submit.prevent="submitPost" class="p-6 space-y-6">
        <!-- 情绪选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            {{ $t('modals.createPost.selectEmotion') }} <span class="text-red-500">*</span>
          </label>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              v-for="emotion in emotions"
              :key="emotion.type"
              type="button"
              @click="selectedEmotion = emotion.type"
              :class="[
                'p-2 sm:p-4 rounded-lg border-2 transition-all duration-200 text-center',
                selectedEmotion === emotion.type
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              ]"
            >
              <div :class="`i-${emotion.icon.replace(':', '-')} text-xl sm:text-2xl mb-1 sm:mb-2 mx-auto`"></div>
              <div class="text-xs sm:text-sm font-medium">{{ emotion.label }}</div>
            </button>
          </div>
        </div>

        <!-- 内容输入 -->
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('modals.createPost.writeContent') }} <span class="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            v-model="content"
            :placeholder="$t('modals.createPost.contentPlaceholder')"
            class="textarea"
            rows="6"
            maxlength="1000"
            required
          ></textarea>
          <div class="flex justify-between items-center mt-2">
            <span class="text-sm text-gray-500">
              {{ $t('modals.createPost.emojiSupport') }}
            </span>
            <span class="text-sm text-gray-500">
              {{ content.length }}/1000
            </span>
          </div>
        </div>

        <!-- 标签 -->
        <div>
          <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('modals.createPost.addTags') }}
          </label>
          <div class="flex flex-wrap gap-2 mb-2">
            <span
              v-for="tag in tags"
              :key="tag"
              class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center space-x-1"
            >
              <span>#{{ tag }}</span>
              <button
                type="button"
                @click="removeTag(tag)"
                class="text-blue-600 hover:text-blue-800"
              >
                <div class="i-mdi-close text-sm"></div>
              </button>
            </span>
          </div>
          <div class="flex space-x-2">
            <input
              id="tagInput"
              v-model="tagInput"
              @keydown.enter.prevent="addTag"
              :placeholder="$t('modals.createPost.tagPlaceholder')"
              class="input flex-1"
              maxlength="20"
            />
            <button
              type="button"
              @click="addTag"
              class="btn-secondary"
            >
              {{ $t('modals.createPost.add') }}
            </button>
          </div>
          <p class="text-sm text-gray-500 mt-1">
            {{ $t('modals.createPost.tagLimit') }}
          </p>
        </div>

        <!-- 匿名设置 -->
        <div>
          <div class="flex items-center space-x-3 mb-3">
            <input
              id="anonymous"
              v-model="isAnonymous"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="anonymous" class="text-sm font-medium text-gray-700">
              {{ $t('modals.createPost.anonymous') }}
              <span class="text-xs text-gray-500 ml-1">{{ $t('modals.createPost.recommended') }}</span>
            </label>
          </div>
          
          <!-- 非匿名时的用户名输入 -->
          <div v-if="!isAnonymous" class="mt-3">
            <label for="author" class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('modals.createPost.displayName') }} <span class="text-red-500">*</span>
            </label>
            <input
              id="author"
              v-model="author"
              type="text"
              :placeholder="$t('modals.createPost.namePlaceholder')"
              class="input"
              maxlength="20"
              :required="!isAnonymous"
            />
            <p class="text-sm text-gray-500 mt-1">
              {{ $t('modals.createPost.nameLimit') }}
            </p>
          </div>
        </div>

        <!-- 提示信息 -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start space-x-3">
            <div class="i-mdi-information text-blue-500 text-xl mt-0.5"></div>
            <div class="text-sm text-blue-700">
              <p class="font-medium mb-1">{{ $t('modals.createPost.privacyTitle') }}</p>
              <ul class="space-y-1">
                <li>• {{ $t('modals.createPost.privacy1') }}</li>
                <li>• {{ $t('modals.createPost.privacy2') }}</li>
                <li>• {{ $t('modals.createPost.privacy3') }}</li>
              </ul>
            </div>
          </div>
        </div>

          <!-- 操作按钮 -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              {{ $t('modals.createPost.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="!canSubmit"
              :style="{ 
                backgroundColor: canSubmit ? '#3b82f6' : '#93c5fd',
                color: '#ffffff',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                opacity: canSubmit ? '1' : '0.75'
              }"
              class="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-600"
            >
              <div class="i-mdi-send"></div>
              <span>{{ $t('modals.createPost.submit') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '#imports'
import type { EmotionType, CreatePostData } from '../types/emotion'

// 国际化
const { t: $t } = useI18n()

// 定义props
const props = defineProps<{
  initialEmotion?: EmotionType
}>()

// 定义事件
const emit = defineEmits<{
  close: []
  created: [post: any]
}>()

// 响应式数据
const selectedEmotion = ref<EmotionType>(props.initialEmotion || 'neutral')

// 监听props变化，更新选中的情绪
watch(() => props.initialEmotion, (newEmotion) => {
  if (newEmotion) {
    selectedEmotion.value = newEmotion
  }
})
const content = ref('')
const tags = ref<string[]>([])
const tagInput = ref('')
const isAnonymous = ref(true)
const author = ref('')

// 情绪配置 - 使用国际化
const emotions = computed(() => [
  { type: 'happy' as const, label: $t('emotions.happy'), icon: 'mdi:emoticon-happy' },
  { type: 'sad' as const, label: $t('emotions.sad'), icon: 'mdi:emoticon-sad' },
  { type: 'angry' as const, label: $t('emotions.angry'), icon: 'mdi:emoticon-angry' },
  { type: 'anxious' as const, label: $t('emotions.anxious'), icon: 'mdi:emoticon-confused' },
  { type: 'excited' as const, label: $t('emotions.excited'), icon: 'mdi:emoticon-excited' },
  { type: 'frustrated' as const, label: $t('emotions.frustrated'), icon: 'mdi:emoticon-cry' },
  { type: 'grateful' as const, label: $t('emotions.grateful'), icon: 'mdi:emoticon-kiss' },
  { type: 'neutral' as const, label: $t('emotions.neutral'), icon: 'mdi:emoticon-neutral' }
])

// 计算属性
const canSubmit = computed(() => {
  const hasEmotion = selectedEmotion.value
  const hasContent = content.value.trim().length > 0
  const hasAuthorIfNotAnonymous = isAnonymous.value || author.value.trim().length > 0
  
  return hasEmotion && hasContent && hasAuthorIfNotAnonymous
})

// 工具方法
const getEmotionLabel = (emotion: EmotionType) => {
  const emotionItem = emotions.value.find(e => e.type === emotion)
  return emotionItem ? emotionItem.label : emotion
}

// 方法
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && tags.value.length < 5 && !tags.value.includes(tag)) {
    tags.value.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (tag: string) => {
  const index = tags.value.indexOf(tag)
  if (index > -1) {
    tags.value.splice(index, 1)
  }
}

const submitPost = () => {
  if (!canSubmit.value) return
  const postData: CreatePostData = {
    content: content.value.trim(),
    emotion: selectedEmotion.value,
    isAnonymous: isAnonymous.value,
    tags: tags.value.length > 0 ? tags.value : undefined,
    author: isAnonymous.value ? undefined : (author.value.trim() || undefined)
  }

  // 创建新帖子
  const newPost = {
    id: Date.now().toString(),
    ...postData,
    timestamp: new Date(),
    likes: 0,
    comments: [],
    liked: false
  }
  emit('created', newPost)
  
  // 重置表单
  resetForm()
}

const resetForm = () => {
  selectedEmotion.value = props.initialEmotion || 'neutral'
  content.value = ''
  tags.value = []
  tagInput.value = ''
  isAnonymous.value = true
  author.value = ''
}
</script>
