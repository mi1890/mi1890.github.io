import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, Tag } from 'lucide-react'
import type { Article } from '../types'

interface ArticleCardProps {
  article: Article
  index?: number
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, index = 0 }) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card card-hover p-6 h-full flex flex-col"
    >
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
          >
            <Tag className="w-3 h-3 mr-1" />
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
        <Link
          to={`/article/${article.slug}`}
          className="hover:text-blue-600 transition-colors duration-300"
        >
          {article.title}
        </Link>
      </h2>

      {/* Excerpt */}
      <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
        {article.excerpt}
      </p>

      {/* Meta Information */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <time dateTime={article.date}>
              {formatDate(article.date)}
            </time>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{article.readingTime} 分钟阅读</span>
          </div>
        </div>
        <Link
          to={`/article/${article.slug}`}
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300"
        >
          阅读更多 →
        </Link>
      </div>
    </motion.article>
  )
}

export default ArticleCard
