<template>
  <div class="language-switcher">
    <div class="current-locale" @click="toggleDropdown">
      <span class="flag">{{ currentFlag }}</span>
      <span class="name">{{ currentName }}</span>
      <div class="chevron" :class="{ 'rotated': isOpen }">
        <div class="i-mdi-chevron-down"></div>
      </div>
    </div>
    
    <div v-if="isOpen" class="dropdown">
      <div
        v-for="locale in supportedLocales"
        :key="locale.code"
        class="locale-option"
        :class="{ 'active': locale.code === currentLocale }"
        @click="selectLocale(locale.code)"
      >
        <span class="flag">{{ locale.flag }}</span>
        <span class="name">{{ locale.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n, useSwitchLocalePath } from '#imports'

// 使用 @nuxtjs/i18n 模块的内置功能
const { locale, t: $t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// 支持的语言配置 - 使用国际化
const supportedLocales = computed(() => [
  { code: 'zh-CN' as const, name: $t('languageSwitcher.chinese'), flag: '🇨🇳' },
  { code: 'en' as const, name: $t('languageSwitcher.english'), flag: '🇺🇸' },
  { code: 'ja' as const, name: $t('languageSwitcher.japanese'), flag: '🇯🇵' }
])

type LocaleCode = 'zh-CN' | 'en' | 'ja'

const currentLocale = computed(() => locale.value)

const isOpen = ref(false)

const currentFlag = computed(() => {
  const locale = supportedLocales.value.find(l => l.code === currentLocale.value)
  return locale?.flag || '🌐'
})

const currentName = computed(() => {
  const locale = supportedLocales.value.find(l => l.code === currentLocale.value)
  return locale?.name || $t('languageSwitcher.language')
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectLocale = async (localeCode: LocaleCode) => {
  // 使用 @nuxtjs/i18n 的内置语言切换功能
  await navigateTo(switchLocalePath(localeCode))
  isOpen.value = false
}

// 点击外部关闭下拉菜单
const closeDropdown = (event: Event) => {
  if (!(event.target as Element).closest('.language-switcher')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
}

.current-locale {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.current-locale:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.flag {
  font-size: 14px;
}

.name {
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.chevron {
  color: white;
  transition: transform 0.2s ease;
  font-size: 12px;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
  min-width: 120px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.locale-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.locale-option:hover {
  background-color: #f5f5f5;
}

.locale-option.active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.locale-option .flag {
  font-size: 16px;
}

.locale-option .name {
  font-size: 14px;
  color: inherit;
}
</style>
