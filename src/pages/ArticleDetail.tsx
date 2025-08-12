import React, { useEffect, useState } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
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
  MessageCircle,
  Copy,
  Check
} from 'lucide-react'
import { Article } from '../types'
import { useBlog } from '../context/BlogContext'
import LoadingSpinner from '../components/LoadingSpinner'
import CommentSection from '../components/CommentSection'

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { getArticle } = useBlog()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setError('文章 slug 未找到')
      setLoading(false)
      return
    }

    const loadArticle = async () => {
      try {
        setLoading(true)
        const articleData = await getArticle(slug)
        if (articleData) {
          setArticle(articleData)
        } else {
          setError('文章未找到')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载文章失败')
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [slug, getArticle])

  const handleShare = async () => {
    if (!article) return
    
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

  const handleCopyCode = async (code: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(codeId)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !article) {
    return <Navigate to="/404" replace />
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
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
        <header className="space-y-4">
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
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
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <time dateTime={article.date}>
                {new Date(article.date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            {article.readingTime && (
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>{article.readingTime} 分钟阅读</span>
              </div>
            )}
          </div>

        </header>

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
        >

        {/* 文章内容 */}
        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-strong:text-gray-900">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // 自定义代码块样式 - 带通用语法高亮和复制功能
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '')
                const language = match ? match[1] : ''
                const code = String(children).replace(/\n$/, '')
                const codeId = `code-${Math.random().toString(36).substr(2, 9)}`
                
                // 简单的语法高亮函数
                const highlightCode = (code: string) => {
                  if (!code || typeof code !== 'string') return code
                  
                  let highlightedCode = code
                  
                  // 先转义HTML特殊字符，避免冲突
                  highlightedCode = highlightedCode
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                  
                  // 通用关键词高亮
                  const keywords = [
                    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'class', 'extends', 'import', 'export', 'default', 'from', 'as', 'typeof', 'instanceof', 'in', 'of', 'async', 'await', 'yield',
                    'React', 'useState', 'useEffect', 'useContext', 'useCallback', 'useMemo', 'useRef', 'useReducer', 'Fragment', 'Component', 'PureComponent', 'forwardRef', 'memo',
                    'display', 'position', 'flex', 'grid', 'width', 'height', 'margin', 'padding', 'border', 'background', 'color', 'font', 'text', 'transform', 'transition', 'animation',
                    'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'lambda', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False',
                    'public', 'private', 'protected', 'static', 'final', 'abstract', 'interface', 'enum', 'extends', 'implements', 'super', 'this', 'null', 'true', 'false', 'void', 'int', 'string', 'bool', 'double', 'float', 'char'
                  ]
                  
                  // 高亮字符串（先处理，避免和关键词冲突）
                  highlightedCode = highlightedCode.replace(
                    /(["'`])([^"'`]*?)\1/g,
                    '<span style="color: #50fa7b;">$1$2$1</span>'
                  )
                  
                  // 高亮注释
                  highlightedCode = highlightedCode.replace(
                    /\/\/.*$/gm,
                    '<span style="color: #6272a4; font-style: italic;">$&</span>'
                  )
                  highlightedCode = highlightedCode.replace(
                    /\/\*[\s\S]*?\*\//g,
                    '<span style="color: #6272a4; font-style: italic;">$&</span>'
                  )
                  
                  // 高亮关键词
                  keywords.forEach(keyword => {
                    const regex = new RegExp(`\\b${keyword}\\b`, 'g')
                    highlightedCode = highlightedCode.replace(regex, (match, offset, string) => {
                      // 检查是否在已有的span标签内
                      const before = string.substring(0, offset)
                      const openSpans = (before.match(/<span/g) || []).length
                      const closeSpans = (before.match(/<\/span>/g) || []).length
                      if (openSpans > closeSpans) {
                        return match // 在span内，不替换
                      }
                      return `<span style="color: #ff79c6; font-weight: 500;">${match}</span>`
                    })
                  })
                  
                  // 高亮数字
                  highlightedCode = highlightedCode.replace(
                    /\b(\d+\.?\d*)\b/g,
                    (match, p1, offset, string) => {
                      const before = string.substring(0, offset)
                      const openSpans = (before.match(/<span/g) || []).length
                      const closeSpans = (before.match(/<\/span>/g) || []).length
                      if (openSpans > closeSpans) {
                        return match
                      }
                      return `<span style="color: #bd93f9;">${p1}</span>`
                    }
                  )
                  
                  // 高亮函数调用
                  highlightedCode = highlightedCode.replace(
                    /\b(\w+)(?=\s*\()/g,
                    (match, p1, offset, string) => {
                      const before = string.substring(0, offset)
                      const openSpans = (before.match(/<span/g) || []).length
                      const closeSpans = (before.match(/<\/span>/g) || []).length
                      if (openSpans > closeSpans) {
                        return match
                      }
                      return `<span style="color: #8be9fd;">${p1}</span>`
                    }
                  )
                  
                  return highlightedCode
                }
                
                return !inline ? (
                  <div className="relative my-6 not-prose group">
                    <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-4 py-2 border-b border-gray-700">
                      {language && (
                        <span className="text-gray-300 text-xs font-medium">
                          {language}
                        </span>
                      )}
                      <button
                        onClick={() => handleCopyCode(code, codeId)}
                        className="flex items-center space-x-1 text-gray-400 hover:text-gray-200 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="复制代码"
                      >
                        {copiedCode === codeId ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span className="text-xs">已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="text-xs">复制</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 rounded-b-lg p-4 shadow-lg border border-gray-700 border-t-0 overflow-hidden">
                      <code 
                        className="font-mono text-sm leading-snug text-gray-100 block whitespace-pre-wrap break-words overflow-wrap-anywhere"
                        {...props}
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(code)
                        }}
                        style={{
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere',
                          maxWidth: '100%'
                        }}
                      />
                    </pre>
                  </div>
                ) : (
                  <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-sm border border-gray-200 not-prose" {...props}>
                    {children}
                  </code>
                )
              },
              // 移除 pre 标签的默认样式，完全自定义
              pre: ({ children }) => <>{children}</>,
              // 自定义引用块样式
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-blue-500 bg-blue-50 pl-6 py-4 my-8 italic text-gray-700 rounded-r-lg not-prose"
                  {...props}
                />
              ),
              // 自定义表格样式
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-8 not-prose">
                  <table className="min-w-full border border-gray-300 rounded-lg shadow-sm" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="bg-gray-100 border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-gray-300 px-4 py-3 text-gray-600" {...props} />
              ),
              // 自定义图片样式
              img: ({ node, ...props }) => (
                <img
                  className="max-w-full h-auto rounded-xl shadow-lg mx-auto my-8 border border-gray-200"
                  {...props}
                />
              ),
              // 自定义链接样式
              a: ({ node, ...props }) => (
                <a
                  className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-all duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              // 自定义标题样式
              h1: ({ node, ...props }) => (
                <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-6 border-b-2 border-gray-200 pb-3 first:mt-0" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4 border-b border-gray-200 pb-2" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3 border-b border-gray-100 pb-1" {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2" {...props} />
              ),
              // 自定义列表样式
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 my-6 space-y-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 my-6 space-y-2" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-gray-700 leading-relaxed" {...props} />
              ),
              // 自定义段落样式
              p: ({ node, ...props }) => (
                <p className="text-gray-700 leading-relaxed my-6 first:mt-0 last:mb-0" {...props} />
              ),
              // 自定义分割线样式
              hr: ({ node, ...props }) => (
                <hr className="my-12 border-t-2 border-gray-200" {...props} />
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </motion.article>

      {/* Article Actions */}
      <div className="flex flex-wrap gap-4 my-8">
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

      {/* 评论区 */}
      <CommentSection 
        articleSlug={article.slug} 
        articleTitle={article.title}
      />
      </motion.div>
    </div>
  )
}

export default ArticleDetail
