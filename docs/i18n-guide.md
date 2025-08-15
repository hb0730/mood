# 国际化 (i18n) 使用指南

## 概述

本项目已配置完整的国际化支持，支持中文、英文和日文三种语言。

## 支持的语言

- 🇨🇳 **中文 (zh-CN)** - 默认语言
- 🇺🇸 **English (en)** - 英文
- 🇯🇵 **日本語 (ja)** - 日文

## 文件结构

```
locales/
├── zh-CN.json    # 中文语言文件
├── en.json       # 英文语言文件
└── ja.json       # 日文语言文件

composables/
└── useI18n.ts    # 国际化组合式函数

components/
├── LanguageSwitcher.vue  # 语言切换组件
└── I18nExample.vue       # 使用示例组件

plugins/
└── i18n.client.ts        # 客户端国际化插件
```

## 使用方法

### 1. 在组件中使用翻译

```vue
<template>
  <div>
    <h1>{{ t('app.name') }}</h1>
    <p>{{ t('app.description') }}</p>
    <button>{{ t('actions.submit') }}</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
</script>
```

### 2. 语言切换

```vue
<template>
  <LanguageSwitcher />
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { switchLocale } = useI18n()

// 手动切换语言
const changeToEnglish = () => {
  switchLocale('en')
}
</script>
```

### 3. 获取当前语言

```vue
<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'

const { currentLocale, supportedLocales } = useI18n()

// 当前语言代码
console.log(currentLocale.value) // 'zh-CN'

// 支持的语言列表
console.log(supportedLocales)
</script>
```

## 语言文件格式

语言文件使用嵌套的 JSON 结构：

```json
{
  "app": {
    "name": "应用名称",
    "description": "应用描述"
  },
  "actions": {
    "submit": "提交",
    "cancel": "取消"
  }
}
```

### 访问嵌套键值

```vue
<template>
  <!-- 访问 app.name -->
  <h1>{{ t('app.name') }}</h1>
  
  <!-- 访问 actions.submit -->
  <button>{{ t('actions.submit') }}</button>
</template>
```

## 添加新语言

### 1. 创建语言文件

在 `locales/` 目录下创建新的语言文件，例如 `ko.json`：

```json
{
  "app": {
    "name": "애플리케이션 이름",
    "description": "애플리케이션 설명"
  }
}
```

### 2. 更新支持的语言列表

在 `composables/useI18n.ts` 中添加新语言：

```typescript
export const supportedLocales = [
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' }  // 新增
]
```

## 动态内容翻译

### 1. 带参数的翻译

```json
{
  "messages": {
    "welcome": "欢迎，{name}！",
    "posts": "共有 {count} 条帖子"
  }
}
```

```vue
<template>
  <p>{{ t('messages.welcome', { name: userName }) }}</p>
  <p>{{ t('messages.posts', { count: postCount }) }}</p>
</template>
```

### 2. 复数形式处理

```json
{
  "messages": {
    "post": {
      "one": "1 条帖子",
      "other": "{count} 条帖子"
    }
  }
}
```

## 最佳实践

### 1. 键名命名规范

- 使用点号分隔的层级结构
- 使用小写字母和下划线
- 保持键名简洁明了

```json
{
  "user": {
    "profile": {
      "edit_button": "编辑资料"
    }
  }
}
```

### 2. 避免硬编码文本

❌ 错误做法：
```vue
<template>
  <button>提交</button>
</template>
```

✅ 正确做法：
```vue
<template>
  <button>{{ t('actions.submit') }}</button>
</template>
```

### 3. 默认值处理

```vue
<script setup lang="ts">
const { t } = useI18n()

// 如果翻译不存在，显示默认值
const message = t('messages.notFound') || '未找到相关内容'
</script>
```

## 调试和测试

### 1. 检查翻译键

```vue
<script setup lang="ts">
const { t } = useI18n()

// 开发环境下显示翻译键
const debugMessage = process.dev ? `[${key}]` : t(key)
</script>
```

### 2. 语言切换测试

- 切换不同语言，检查所有文本是否正确翻译
- 验证动态内容是否正确显示
- 检查日期、数字等格式是否符合本地化要求

## 性能优化

### 1. 懒加载语言文件

语言文件会在需要时自动加载，无需预加载所有语言。

### 2. 缓存机制

用户选择的语言会保存在 localStorage 中，下次访问时自动恢复。

## 故障排除

### 常见问题

1. **翻译不显示**
   - 检查语言文件是否正确加载
   - 验证翻译键是否存在
   - 确认组件中正确导入了 `useI18n`

2. **语言切换不生效**
   - 检查浏览器控制台是否有错误
   - 验证语言文件路径是否正确
   - 确认 `switchLocale` 函数被正确调用

3. **类型错误**
   - 检查 TypeScript 类型定义
   - 验证导入路径是否正确

## 更多资源

- [Vue I18n 官方文档](https://vue-i18n.intlify.dev/)
- [Nuxt.js 国际化](https://nuxt.com/docs/guide/directory-structure/pages#internationalization)
- [国际化最佳实践](https://www.w3.org/International/)
