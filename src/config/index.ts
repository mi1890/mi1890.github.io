import configData from './config.json'

interface ConfigData {
  site: {
    name: string
    description: string
    url: string
    hero: {
      title: string
      subtitle: string
      features: Array<{
        icon: string
        text: string
        color: string
      }>
    }
    sections: {
      recentArticles: {
        title: string
        viewAllText: string
        emptyState: {
          title: string
          description: string
        }
      }
      callToAction: {
        title: string
        description: string
        buttons: Array<{
          text: string
          link: string
          type: string
        }>
      }
    }
  }
  pagination: {
    itemsPerPage: number
    maxVisiblePages: number
  }
  author: {
    name: string
    title: string
    subtitle: string
    description: string
    bio: string[]
    location: string
    contacts: Array<{
      type: string
      label: string
      url: string
      icon: string
    }>
  }
  comments: {
    enabled: boolean
    giscus: {
      repo: string
      repoId: string
      category: string
      categoryId: string
      mapping: string
      strict: string
      reactionsEnabled: string
      emitMetadata: string
      inputPosition: string
      theme: string
      lang: string
      loading: string
    }
  }
  skills: string[]
  interests: Array<{
    name: string
    description: string
    icon: string
    color: string
  }>
  timeline: Array<{
    year: string
    title: string
    description: string
  }>
}

/**
 * 应用配置管理器
 */
class ConfigManager {
  private config: ConfigData
  private isProduction: boolean
  private runtimeConfig: ConfigData | null
  private isLoading: boolean

  constructor() {
    this.config = configData as ConfigData
    this.isProduction = import.meta.env.PROD as boolean
    this.runtimeConfig = null
    this.isLoading = false
  }

  /**
   * 检查是否为生产环境
   */
  get isProductionEnv() {
    return this.isProduction
  }

  /**
   * 在生产环境中初始化运行时配置
   */
  async initRuntimeConfig() {
    if (!this.isProduction || this.runtimeConfig || this.isLoading) {
      return
    }

    this.isLoading = true
    try {
      const basePath = import.meta.env.BASE_URL || '/'
      const configUrl = `${basePath}config/config.json`
      
      const response = await fetch(configUrl)
      if (response.ok) {
        this.runtimeConfig = await response.json()
      }
    } catch (error) {
      console.warn('运行时配置加载失败，使用默认配置:', error)
    } finally {
      this.isLoading = false
    }
  }

  /**
   * 获取当前配置
   */
  _getCurrentConfig() {
    return this.runtimeConfig || this.config
  }

  /**
   * 获取站点配置
   */
  getSiteConfig() {
    return this._getCurrentConfig().site
  }

  /**
   * 获取分页配置
   */
  getPaginationConfig() {
    return this._getCurrentConfig().pagination
  }

  /**
   * 获取作者信息
   */
  getAuthorInfo() {
    return this._getCurrentConfig().author
  }

  /**
   * 获取技能列表
   */
  getSkills() {
    return this._getCurrentConfig().skills
  }

  /**
   * 获取兴趣爱好
   */
  getInterests() {
    return this._getCurrentConfig().interests
  }

  /**
   * 获取时间轴
   */
  getTimeline() {
    return this._getCurrentConfig().timeline
  }

  /**
   * 获取评论配置
   */
  getCommentsConfig() {
    return this._getCurrentConfig().comments
  }

  /**
   * 获取网站配置
   */
  getSiteInfo() {
    return this._getCurrentConfig().site
  }

  /**
   * 获取完整配置
   */
  getConfig() {
    return this._getCurrentConfig()
  }
}

// 创建单例实例
const configManager = new ConfigManager()

// 在生产环境中初始化运行时配置
if (configManager.isProductionEnv) {
  configManager.initRuntimeConfig()
}

export default configManager
