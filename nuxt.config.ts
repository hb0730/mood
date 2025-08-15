// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // 全局禁用SSR以彻底解决水合错误
  ssr: true,
  
  // 启用UnoCSS和国际化
  modules: [
    '@unocss/nuxt',
    '@nuxtjs/i18n'
  ],
  
  // UnoCSS配置
  css: [
    '@unocss/reset/tailwind.css',
    '~/assets/css/main.css'
  ],
  
  // 应用配置
  app: {
    head: {
      title: '匿名情绪发泄站 - 安全匿名情绪发泄平台',
      htmlAttrs: {
        lang: 'zh-CN'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
        { name: 'description', content: '匿名情绪发泄站是一个完全安全的匿名情绪发泄平台，支持8种情绪状态，让每个人都能自由表达内心感受，释放压力，获得心理支持。' },
        { name: 'keywords', content: '情绪发泄,匿名发泄,心理支持,情绪管理,压力释放,心理健康,匿名平台,情绪表达,心理疏导,情感宣泄' },
        { name: 'author', content: '匿名情绪发泄站' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://mood.hb0730.me/' },
        { property: 'og:title', content: '匿名情绪发泄站 - 安全匿名情绪发泄平台' },
        { property: 'og:description', content: '匿名情绪发泄站是一个完全安全的匿名情绪发泄平台，支持8种情绪状态，让每个人都能自由表达内心感受，释放压力，获得心理支持。' },
        { property: 'og:image', content: 'https://mood.hb0730.me/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'zh_CN' },
        { property: 'og:site_name', content: '匿名情绪发泄站' },
        
        // Twitter
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:url', content: 'https://mood.hb0730.me/' },
        { property: 'twitter:title', content: '匿名情绪发泄站 - 安全匿名情绪发泄平台' },
        { property: 'twitter:description', content: '匿名情绪发泄站是一个完全安全的匿名情绪发泄平台，支持8种情绪状态，让每个人都能自由表达内心感受，释放压力，获得心理支持。' },
        { property: 'twitter:image', content: 'https://mood.hb0730.me/og-image.jpg' },
        
        // 其他重要meta标签
        { name: 'theme-color', content: '#667eea' },
        { name: 'msapplication-TileColor', content: '#667eea' },
        { name: 'msapplication-config', content: '/browserconfig.xml' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: '情绪发泄站' },
        { name: 'application-name', content: '匿名情绪发泄站' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'format-detection', content: 'telephone=no' },
        
        // 结构化数据
        { name: 'application/ld+json', content: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "匿名情绪发泄站",
          "description": "一个安全的匿名情绪发泄平台",
          "url": "https://mood.hb0730.me/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://mood.hb0730.me/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      ],
      link: [
        // 优先使用SVG格式，支持现代浏览器
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // 兼容性支持，传统ICO格式
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // 不同尺寸的favicon
        { rel: 'icon', type: 'image/svg+xml', sizes: '16x16', href: '/favicon-16.svg' },
        { rel: 'icon', type: 'image/svg+xml', sizes: '32x32', href: '/favicon-32.svg' },
        { rel: 'icon', type: 'image/svg+xml', sizes: '48x48', href: '/favicon-48.svg' },
        // Apple设备支持
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.svg' },
        // 预连接优化
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // 规范链接
        { rel: 'canonical', href: 'https://mood.hb0730.me/' },
        // PWA支持
        { rel: 'manifest', href: '/manifest.json' }
      ],
      script: [
        // 结构化数据脚本
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "匿名情绪发泄站",
            "url": "https://mood.hb0730.me/",
            "logo": "https://mood.hb0730.me/logo.png",
            "description": "一个安全的匿名情绪发泄平台",
            "sameAs": [
              "https://weibo.com/your-account",
              "https://twitter.com/your-account"
            ]
          })
        }
      ]
    }
  },
  
  // 国际化配置
  i18n: {
    vueI18n: '~/locales/i18n.config.ts',
    locales: [
      { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' }
    ],
    defaultLocale: 'zh-CN',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    bundle:{
      optimizeTranslationDirective: false
    }
  },
  
  // 运行时配置
  runtimeConfig: {
    public: {
      appName: '匿名情绪发泄站'
    }
  }
})
