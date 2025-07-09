import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  Calendar, 
  Clock, 
  Tag, 
  ArrowLeft, 
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { useBlog } from '../context/BlogContext'

const ArticleDetail = () => {
  const { slug } = useParams()
  const { getArticleBySlug, formatDate, loading } = useBlog()
  
  if (loading) {
    return <LoadingSpinner text="正在加载文章..." />
  }

  const article = getArticleBySlug(slug)

  if (!article) {
    return <Navigate to="/articles" replace />
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        console.log('分享失败:', err)
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Back Button */}
        <Link
          to="/articles"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回文章列表</span>
        </Link>

        {/* Article Header */}
        <header className="space-y-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <time dateTime={article.date}>
                {formatDate(article.date)}
              </time>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>{article.readTime} 分钟阅读</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
            >
              <Share2 className="w-4 h-4" />
              <span>分享</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300">
              <Heart className="w-4 h-4" />
              <span>喜欢</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300">
              <MessageCircle className="w-4 h-4" />
              <span>评论</span>
            </button>
          </div>
        </header>

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card p-8"
        >
          <div className="prose-custom">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                code: ({ inline, children }) => 
                  inline ? (
                    <code className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                      <code className="font-mono text-sm">
                        {children}
                      </code>
                    </pre>
                  ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
                    {children}
                  </ol>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </motion.article>

        {/* Article Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="card p-6 text-center"
        >
          <p className="text-gray-600 mb-4">
            感谢阅读！如果这篇文章对你有帮助，欢迎分享给更多人。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
            >
              分享文章
            </button>
            <Link
              to="/articles"
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300 font-medium"
            >
              查看更多文章
            </Link>
          </div>
        </motion.footer>
      </motion.div>
    </div>
  )
}

export default ArticleDetail
