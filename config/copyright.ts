/**
 * 版权信息配置文件
 * 统一管理项目的版权、归属和时间信息
 */

export interface CopyrightInfo {
  projectName: string
  projectDescription: string
  copyright: string
  rights: string
  technologies: Technology[]
  contact: ContactInfo
  social: SocialLinks
  legal: LegalInfo
}

export interface Technology {
  name: string
  url: string
  description: string
}

export interface ContactInfo {
  support: string
  feedback: string
  business: string
  general: string
}

export interface SocialLinks {
  weibo?: string
  twitter?: string
  github?: string
  linkedin?: string
}

export interface LegalInfo {
  license: string
  terms: string
  privacy: string
  disclaimer: string
}

// 版权信息配置
export const copyrightConfig: CopyrightInfo = {
  projectName: '匿名情绪发泄站',
  projectDescription: '一个安全、匿名的情绪发泄平台，让每个人都能自由表达内心感受',
  copyright: `© ${new Date().getFullYear()} 匿名情绪发泄站`,
  rights: '保留所有权利',
  
  // 技术栈信息
  technologies: [
    {
      name: 'Nuxt 3',
      url: 'https://nuxt.com/',
      description: '全栈Vue框架'
    },
    {
      name: 'Vue 3',
      url: 'https://vuejs.org/',
      description: '渐进式JavaScript框架'
    },
    {
      name: 'UnoCSS',
      url: 'https://unocss.dev/',
      description: '原子化CSS引擎'
    },
    {
      name: 'Prisma',
      url: 'https://www.prisma.io/',
      description: '类型安全数据库工具'
    }
  ],
  
  // 联系信息
  contact: {
    support: 'support@your-domain.com',
    feedback: 'feedback@your-domain.com',
    business: 'business@your-domain.com',
    general: 'info@your-domain.com'
  },
  
  // 社交媒体链接
  social: {
    weibo: 'https://weibo.com/your-account',
    twitter: 'https://twitter.com/your-account',
    github: 'https://github.com/your-username/octopus-emotion',
    linkedin: 'https://linkedin.com/company/your-company'
  },
  
  // 法律信息
  legal: {
    license: 'MIT License',
    terms: '/terms',
    privacy: '/privacy',
    disclaimer: '本平台仅供情绪发泄使用，不承担任何法律责任'
  }
}

// 获取当前年份
export const getCurrentYear = (): number => {
  return new Date().getFullYear()
}

// 获取当前日期
export const getCurrentDate = (): string => {
  return new Date().toLocaleDateString('zh-CN')
}

// 获取当前时间
export const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

// 获取版权文本
export const getCopyrightText = (): string => {
  return `${copyrightConfig.copyright}. ${copyrightConfig.rights}`
}

// 获取技术栈链接文本
export const getTechnologiesText = (): string => {
  return `基于 ${copyrightConfig.technologies.map(tech => 
    `<a href="${tech.url}" target="_blank" class="text-blue-500 hover:text-blue-600">${tech.name}</a>`
  ).join(' + ')} 构建`
}

// 获取联系信息
export const getContactInfo = (): ContactInfo => {
  return copyrightConfig.contact
}

// 获取社交媒体链接
export const getSocialLinks = (): SocialLinks => {
  return copyrightConfig.social
}

// 获取法律信息
export const getLegalInfo = (): LegalInfo => {
  return copyrightConfig.legal
}
