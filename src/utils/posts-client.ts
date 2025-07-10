// 客户端文章管理工具
// 用于从预处理的数据中获取文章信息

import { Article } from '../types'

// 简单的 frontmatter 解析器（浏览器兼容）
function parseFrontmatter(content: string): { data: any; content: string } {
  const frontmatterMatch = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/m)
  
  if (!frontmatterMatch) {
    return { data: {}, content }
  }

  const frontmatter = frontmatterMatch[1]
  const articleContent = frontmatterMatch[2]
  
  // 解析 YAML frontmatter (简化版)
  const data: any = {}
  const lines = frontmatter.split(/\r?\n/)
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim()
      const value = line.substring(colonIndex + 1).trim()
      
      if (!key || !value) continue
      
      if (key === 'tags') {
        // 解析标签数组：["tag1", "tag2"] 或 [tag1, tag2]
        const tagsMatch = value.match(/\[(.*?)\]/)
        if (tagsMatch) {
          data[key] = tagsMatch[1]
            .split(',')
            .map(tag => tag.trim().replace(/^["']|["']$/g, ''))
            .filter(tag => tag.length > 0)
        } else {
          data[key] = []
        }
      } else {
        // 移除引号
        data[key] = value.replace(/^["']|["']$/g, '')
      }
    }
  }

  return { data, content: articleContent.trim() }
}

// 获取所有文章数据
export async function getAllArticles(): Promise<Article[]> {
  try {
    // 获取基础路径
    const basePath = import.meta.env.BASE_URL || '/'
    
    // 获取文章配置
    const articlesResponse = await fetch(`${basePath}config/articles.json`)
    if (!articlesResponse.ok) {
      throw new Error(`Failed to fetch articles config: ${articlesResponse.status}`)
    }
    const articlesConfig = await articlesResponse.json()
    
    // 获取启用的文章
    const enabledArticles = articlesConfig.articles.filter((article: any) => article.enabled)
    
    // 并行获取所有文章的内容
    const articlePromises = enabledArticles.map(async (articleConfig: any) => {
      try {
        const response = await fetch(`${basePath}posts/${articleConfig.slug}.md`)
        if (!response.ok) {
          throw new Error(`Failed to fetch article ${articleConfig.slug}: ${response.status}`)
        }
        const content = await response.text()
        
        // 使用自定义 frontmatter 解析器
        const { data: metadata, content: articleContent } = parseFrontmatter(content)

        return {
          slug: articleConfig.slug,
          title: metadata.title || articleConfig.slug,
          date: metadata.date || new Date().toISOString().split('T')[0],
          tags: metadata.tags || [],
          excerpt: metadata.excerpt || metadata.description || '',
          content: articleContent,
          readingTime: Math.ceil(articleContent.length / 1000) // 简单估算阅读时间
        } as Article
      } catch (error) {
        console.error(`Error loading article ${articleConfig.slug}:`, error)
        return null
      }
    })
    
    const articles = await Promise.all(articlePromises)
    
    // 过滤掉加载失败的文章，并按日期排序
    return articles
      .filter((article): article is Article => article !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
  } catch (error) {
    console.error('Error loading articles:', error)
    return []
  }
}

// 根据 slug 获取单个文章
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const response = await fetch(`/posts/${slug}.md`)
    if (!response.ok) {
      return null
    }
    
    const content = await response.text()
    
    // 使用自定义 frontmatter 解析器
    const { data: metadata, content: articleContent } = parseFrontmatter(content)

    return {
      slug,
      title: metadata.title || slug,
      date: metadata.date || new Date().toISOString().split('T')[0],
      tags: metadata.tags || [],
      excerpt: metadata.excerpt || metadata.description || '',
      content: articleContent,
      readingTime: Math.ceil(articleContent.length / 1000)
    } as Article
    
  } catch (error) {
    console.error(`Error loading article ${slug}:`, error)
    return null
  }
}

// 获取所有标签
export async function getAllTags(): Promise<string[]> {
  try {
    const articles = await getAllArticles()
    const allTags = articles.flatMap(article => article.tags || [])
    return [...new Set(allTags)].sort()
  } catch (error) {
    console.error('Error loading tags:', error)
    return []
  }
}

// 兼容性别名
export const getAllPosts = getAllArticles
export const getPostBySlug = getArticleBySlug
