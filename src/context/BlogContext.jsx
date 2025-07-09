import React, { createContext, useContext, useState, useEffect } from 'react'
import { format } from 'date-fns'

const BlogContext = createContext()

export const useBlog = () => {
  const context = useContext(BlogContext)
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider')
  }
  return context
}

export const BlogProvider = ({ children }) => {
  const [articles, setArticles] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  // 计算阅读时间（假设每分钟阅读200个中文字符）
  const calculateReadTime = (content) => {
    const wordsPerMinute = 200
    const textLength = content.length
    const readTime = Math.ceil(textLength / wordsPerMinute)
    return Math.max(1, readTime) // 至少1分钟
  }

  // 获取基础路径
  const getBasePath = () => {
    return import.meta.env.MODE === 'production' ? '/mi1890.github.io' : ''
  }

  // 加载文章配置
  const loadArticlesConfig = async () => {
    try {
      const basePath = getBasePath()
      const response = await fetch(`${basePath}/config/articles.json`)
      if (!response.ok) {
        throw new Error('配置文件加载失败')
      }
      return await response.json()
    } catch (error) {
      console.warn('加载配置文件失败，使用默认配置:', error)
      return {
        articles: [
          { slug: 'react-best-practices', enabled: true },
          { slug: 'javascript-async-patterns', enabled: true },
          { slug: 'css-grid-layout', enabled: true },
          { slug: 'typescript-advanced', enabled: true }
        ]
      }
    }
  }

  // 从 markdown 文件加载文章数据
  const loadArticles = async () => {
    try {
      // 动态加载配置文件
      const articlesConfig = await loadArticlesConfig()
      const enabledArticles = articlesConfig.articles.filter(article => article.enabled)
      
      const articlesData = await Promise.all(
        enabledArticles.map(({ slug }) => loadArticle(slug))
      )
      
      return articlesData.filter(Boolean) // 过滤掉加载失败的文章
    } catch (error) {
      console.error('加载文章失败:', error)
      return []
    }
  }

  // 加载单个文章
  const loadArticle = async (slug) => {
    try {
      const basePath = getBasePath()
      const response = await fetch(`${basePath}/posts/${slug}.md`)
      if (!response.ok) {
        throw new Error(`Failed to load ${slug}`)
      }
      
      const content = await response.text()
      const article = parseMarkdown(content, slug)
      
      return article
    } catch (error) {
      console.error(`加载文章 ${slug} 失败:`, error)
      return null
    }
  }

  // 解析 markdown frontmatter 和内容
  const parseMarkdown = (content, slug) => {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
    const match = content.match(frontmatterRegex)
    
    if (!match) {
      return null
    }

    const [, frontmatterStr, markdownContent] = match
    const frontmatter = {}
    
    // 简单解析 frontmatter
    frontmatterStr.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '')
        
        if (key.trim() === 'tags') {
          // 解析标签数组
          const tagsMatch = value.match(/\[(.*?)\]/)
          if (tagsMatch) {
            frontmatter[key.trim()] = tagsMatch[1]
              .split(',')
              .map(tag => tag.trim().replace(/^["']|["']$/g, ''))
          }
        } else {
          frontmatter[key.trim()] = value
        }
      }
    })

    return {
      id: Math.random().toString(36).substr(2, 9),
      slug,
      title: frontmatter.title || 'Untitled',
      excerpt: frontmatter.excerpt || '',
      content: markdownContent.trim(),
      date: frontmatter.date || new Date().toISOString().split('T')[0],
      tags: frontmatter.tags || [],
      readTime: calculateReadTime(markdownContent)
    }
  }

  // 备用的模拟数据（当无法加载文件时使用）
  const fallbackArticles = [
    {
      id: '1',
      slug: 'react-best-practices',
      title: 'React 最佳实践指南',
      excerpt: '深入探讨 React 开发中的最佳实践，包括组件设计、状态管理、性能优化等方面的经验分享。',
      content: `# React 最佳实践指南

React 作为现代前端开发的核心框架，掌握其最佳实践对于构建高质量的应用至关重要。

## 组件设计原则

### 单一职责原则
每个组件都应该有一个明确的职责。

### 合理使用 Props
Props 应该是简洁且语义化的。

## 状态管理

选择合适的状态管理方案，将状态提升到合适的位置。

## 性能优化

使用 React.memo、useCallback 和 useMemo 优化性能。

## 总结

遵循这些最佳实践可以帮助你构建更加健壮、可维护的 React 应用。`,
      date: '2024-01-15',
      tags: ['React', '前端开发', '最佳实践'],
      readTime: 8
    },
    {
      id: '2',
      slug: 'javascript-async-patterns',
      title: 'JavaScript 异步编程模式',
      excerpt: '从回调函数到 Promise，再到 async/await，详细介绍 JavaScript 中的异步编程演进过程。',
      content: `# JavaScript 异步编程模式

JavaScript 的异步编程是现代 Web 开发的核心概念之一。

## 回调函数时代

在早期的 JavaScript 中，回调函数是处理异步操作的主要方式。

## Promise 的崛起

ES6 引入的 Promise 解决了回调地狱的问题。

## async/await 语法糖

ES2017 引入的 async/await 让异步代码看起来更像同步代码。

## 总结

掌握这些异步编程技巧，是成为优秀 JavaScript 开发者的必经之路。`,
      date: '2024-01-10',
      tags: ['JavaScript', '异步编程', 'Promise'],
      readTime: 12
    },
    {
      id: '3',
      slug: 'css-grid-layout',
      title: 'CSS Grid 布局完全指南',
      excerpt: 'CSS Grid 是现代 Web 布局的强大工具，本文将详细介绍其使用方法和实际应用场景。',
      content: `# CSS Grid 布局完全指南

CSS Grid 是现代 Web 开发中最强大的布局工具之一。

## Grid 基础概念

网格容器、网格项、网格线等基本概念。

## 核心属性详解

详细介绍 grid-template-columns、grid-template-rows 等属性。

## 实用布局模式

响应式网格、圣杯布局、卡片网格等实用模式。

## 总结

CSS Grid 提供了前所未有的布局控制能力，代表了 Web 布局的未来方向。`,
      date: '2024-01-05',
      tags: ['CSS', '布局', 'Grid'],
      readTime: 15
    },
    {
      id: '4',
      slug: 'typescript-advanced',
      title: 'TypeScript 进阶指南',
      excerpt: '深入理解 TypeScript 的高级特性，包括泛型、条件类型、映射类型等，提升代码的类型安全性。',
      content: `# TypeScript 进阶指南

TypeScript 作为 JavaScript 的超集，为前端开发带来了强大的类型系统。

## 泛型 (Generics)

基础泛型、约束泛型、高级泛型模式。

## 高级类型

联合类型、交叉类型、字面量类型等。

## 实用工具类型

内置工具类型和自定义工具类型。

## 总结

掌握这些高级特性能够显著提升代码质量和开发效率。`,
      date: '2024-01-20',
      tags: ['TypeScript', 'JavaScript', '类型系统'],
      readTime: 15
    }
  ]

  useEffect(() => {
    // 加载文章数据
    const initializeArticles = async () => {
      setLoading(true)
      
      try {
        const loadedArticles = await loadArticles()
        
        if (loadedArticles.length > 0) {
          setArticles(loadedArticles)
        } else {
          // 如果加载失败，使用备用数据
          console.warn('使用备用文章数据')
          setArticles(fallbackArticles)
        }
        
        // 提取所有标签
        const articlesToUse = loadedArticles.length > 0 ? loadedArticles : fallbackArticles
        const allTags = articlesToUse.flatMap(article => article.tags)
        const uniqueTags = [...new Set(allTags)]
        setTags(uniqueTags)
        
      } catch (error) {
        console.error('初始化文章数据失败:', error)
        setArticles(fallbackArticles)
        
        const allTags = fallbackArticles.flatMap(article => article.tags)
        const uniqueTags = [...new Set(allTags)]
        setTags(uniqueTags)
      } finally {
        setLoading(false)
      }
    }

    initializeArticles()
  }, [])

  const getArticleBySlug = (slug) => {
    return articles.find(article => article.slug === slug)
  }

  const getArticlesByTag = (tag) => {
    return articles.filter(article => article.tags.includes(tag))
  }

  const searchArticles = (query) => {
    if (!query) return articles
    
    const lowercaseQuery = query.toLowerCase()
    return articles.filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.excerpt.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'yyyy年MM月dd日')
  }

  const value = {
    articles,
    tags,
    loading,
    getArticleBySlug,
    getArticlesByTag,
    searchArticles,
    formatDate,
    loadArticle // 暴露加载单个文章的方法
  }

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  )
}
