import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react'
import type { Article } from '../types'

interface ArticleCardProps {
  article: Article
  index?: number
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, index = 0 }) => {
  const cardRef = useRef<HTMLElement>(null)

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 处理鼠标移动，创建光效跟随效果
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    cardRef.current.style.setProperty('--mouse-x', `${x}%`)
    cardRef.current.style.setProperty('--mouse-y', `${y}%`)
  }

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      className="card card-hover p-6 h-full flex flex-col group cursor-pointer"
    >
      {/* Tags - 增加交互效果 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {article.tags.map((tag, tagIndex) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + tagIndex * 0.05 }}
            className="tag-interactive"
          >
            <Tag className="w-3 h-3 mr-1" />
            {tag}
          </motion.span>
        ))}
      </div>

      {/* Title - 增加悬浮效果 */}
      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
        <Link
          to={`/article/${article.slug}`}
          className="link-underline hover:text-blue-600 transition-colors duration-300"
        >
          {article.title}
        </Link>
      </h2>

      {/* Excerpt */}
      <p className="text-gray-600 mb-4 flex-1 line-clamp-3 leading-relaxed">
        {article.excerpt}
      </p>

      {/* Meta Information - 增强样式 */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 group/meta">
            <Calendar className="w-4 h-4 text-gray-400 group-hover/meta:text-blue-500 transition-colors" />
            <time dateTime={article.date} className="group-hover/meta:text-gray-700 transition-colors">
              {formatDate(article.date)}
            </time>
          </div>
          <div className="flex items-center space-x-1.5 group/meta">
            <Clock className="w-4 h-4 text-gray-400 group-hover/meta:text-blue-500 transition-colors" />
            <span className="group-hover/meta:text-gray-700 transition-colors">{article.readingTime} 分钟</span>
          </div>
        </div>
        <Link
          to={`/article/${article.slug}`}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium transition-all duration-300 group/link"
        >
          <span>阅读</span>
          <ArrowRight className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
    </motion.article>
  )
}

export default ArticleCard
