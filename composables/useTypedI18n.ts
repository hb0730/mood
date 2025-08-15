import { useI18n } from '#imports'
import type { TranslationKey, LocaleCode, LocaleConfig } from '~/types/i18n'

/**
 * 类型安全的国际化 composable
 * 提供编译时类型检查和运行时国际化功能
 */
export function useTypedI18n() {
  const { locale, t, locales } = useI18n()

  /**
   * 类型安全的翻译函数
   * @param key 翻译键
   * @param params 参数对象
   * @returns 翻译后的文本
   */
  const typedT = (key: TranslationKey, params?: Record<string, any>): string => {
    return t(key, params)
  }

  /**
   * 获取当前语言代码
   */
  const currentLocale = computed<LocaleCode>(() => locale.value as LocaleCode)

  /**
   * 支持的语言配置
   */
  const supportedLocales = computed<LocaleConfig[]>(() => {
    return (locales.value || []).map(locale => ({
      code: locale.code as LocaleCode,
      name: locale.name || locale.code,
      flag: locale.flag || '🌐'
    }))
  })

  /**
   * 切换语言
   * @param newLocale 新的语言代码
   */
  const switchLocale = async (newLocale: LocaleCode) => {
    if (newLocale !== currentLocale.value) {
      await navigateTo(`/${newLocale === 'zh-CN' ? '' : newLocale}`)
    }
  }

  /**
   * 检查翻译键是否存在
   * @param key 翻译键
   * @returns 是否存在
   */
  const hasTranslation = (key: TranslationKey): boolean => {
    try {
      const result = t(key)
      return result !== key // 如果返回的是原键，说明没有翻译
    } catch {
      return false
    }
  }

  /**
   * 获取翻译键的默认值（用于开发时调试）
   * @param key 翻译键
   * @returns 默认值
   */
  const getDefaultValue = (key: TranslationKey): string => {
    // 这里可以根据键名返回一些默认值
    const keyParts = key.split('.')
    return keyParts[keyParts.length - 1] || key
  }

  return {
    // 基础功能
    t: typedT,
    locale: currentLocale,
    locales: supportedLocales,
    
    // 高级功能
    switchLocale,
    hasTranslation,
    getDefaultValue,
    
    // 类型导出
    type: {
      TranslationKey,
      LocaleCode,
      LocaleConfig
    }
  }
}
