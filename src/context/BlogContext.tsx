import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Article, BlogContextType } from '../types'
import { getAllArticles, getAllTags, getArticleBySlug } from '../utils/posts-client'

const BlogContext = createContext<BlogContextType | undefined>(undefined)

interface BlogProviderProps {
  children: ReactNode
}

export const BlogProvider: React.FC<BlogProviderProps> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [articlesData, tagsData] = await Promise.all([
          getAllArticles(),
          getAllTags()
        ])
        setArticles(articlesData)
        setTags(tagsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const searchArticles = (query: string): Article[] => {
    if (!query.trim()) return articles
    
    const searchTerm = query.toLowerCase()
    return articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  const getArticlesByTag = (tag: string): Article[] => {
    return articles.filter(article => article.tags.includes(tag))
  }

  const getArticle = async (slug: string): Promise<Article | null> => {
    try {
      return await getArticleBySlug(slug)
    } catch (err) {
      console.error('Error getting article:', err)
      return null
    }
  }

  const value: BlogContextType = {
    articles,
    tags,
    loading,
    error,
    searchArticles,
    getArticlesByTag,
    getArticle
  }

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  )
}

export const useBlog = (): BlogContextType => {
  const context = useContext(BlogContext)
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider')
  }
  return context
}
