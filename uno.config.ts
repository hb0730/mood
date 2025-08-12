import { defineConfig, presetUno, presetAttributify, presetIcons, presetTypography } from 'unocss'

export default defineConfig({
  safelist: [
    // 布局类
    'pt-28',
    'md:pt-32',
    
    // 导航栏图标
    'i-mdi-heart',
    'i-mdi-plus',
    'i-mdi-chart-line',
    
    // 情绪图标
    'i-mdi-emoticon-happy',
    'i-mdi-emoticon-sad', 
    'i-mdi-emoticon-angry',
    'i-mdi-emoticon-confused',
    'i-mdi-emoticon-excited',
    'i-mdi-emoticon-cry',
    'i-mdi-emoticon-kiss',
    'i-mdi-emoticon-neutral',
    
    // 功能图标
    'i-mdi-refresh',
    'i-mdi-loading',
    'i-mdi-chevron-down',
    'i-mdi-close',
    'i-mdi-send',
    'i-mdi-send-outline',
    'i-mdi-comment',
    'i-mdi-share',
    'i-mdi-flag',
    'i-mdi-flag-outline',
    'i-mdi-flag-remove',
    'i-mdi-account-circle',
    'i-mdi-incognito',
    'i-mdi-account-edit',
    'i-mdi-information-outline',
    'i-mdi-text-box',
    
    // 管理端图标
    'i-mdi-shield-account',
    'i-mdi-home',
    'i-mdi-check-circle',
    'i-mdi-download',
    'i-mdi-eye-off',
    'i-mdi-broom',
    'i-mdi-calendar-today',
    'i-mdi-inbox',
    'i-mdi-flag-remove',
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: {
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      }
    }),
    presetTypography()
  ],
  shortcuts: [
    ['btn', 'px-4 py-2 rounded-lg font-medium transition-colors duration-200'],
    ['btn-primary', 'btn bg-blue-500 hover:bg-blue-600 text-white'],
    ['btn-secondary', 'btn bg-gray-200 hover:bg-gray-300 text-gray-800'],
    ['btn-danger', 'btn bg-red-500 hover:bg-red-600 text-white'],
    ['card', 'bg-white rounded-xl shadow-lg p-6'],
    ['input', 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'],
    ['textarea', 'input resize-none min-h-32'],
    ['emotion-card', 'card hover:shadow-xl transition-shadow duration-300 cursor-pointer'],
    ['emotion-sad', 'bg-blue-50 border-l-4 border-blue-400'],
    ['emotion-angry', 'bg-red-50 border-l-4 border-red-400'],
    ['emotion-happy', 'bg-green-50 border-l-4 border-green-400'],
    ['emotion-neutral', 'bg-gray-50 border-l-4 border-gray-400'],
    ['scrollable-hidden', 'overflow-auto scrollbar-none'],
    ['no-scrollbar', 'scrollbar-none']
  ],
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8'
      }
    }
  }
})
