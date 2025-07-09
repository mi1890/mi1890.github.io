import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, Calendar, SortAsc, SortDesc } from 'lucide-react'
import ArticleCard from '../components/ArticleCard'
import TagFilter from '../components/TagFilter'
import LoadingSpinner from '../components/LoadingSpinner'
import { useBlog } from '../context/BlogContext'

const Articles = () => {
  const { articles, tags, loading } = useBlog()
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('date-desc') // date-desc, date-asc, title

  // 筛选和排序文章
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles

    // 标签筛选
    if (selectedTags.length > 0) {
      filtered = articles.filter(article =>
        selectedTags.every(tag => article.tags.includes(tag))
      )
    }

    // 排序
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date)
        case 'date-asc':
          return new Date(a.date) - new Date(b.date)
        case 'title':
          return a.title.localeCompare(b.title, 'zh-CN')
        default:
          return 0
      }
    })

    return sorted
  }, [articles, selectedTags, sortBy])

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleClearAllTags = () => {
    setSelectedTags([])
  }

  const sortOptions = [
    { value: 'date-desc', label: '最新发布', icon: SortDesc },
    { value: 'date-asc', label: '最早发布', icon: SortAsc },
    { value: 'title', label: '标题排序', icon: FileText },
  ]

  if (loading) {
    return <LoadingSpinner text="正在加载文章..." />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          文章
        </h1>
        <p className="text-xl text-gray-600">
          分享技术心得与编程思考
        </p>
      </motion.section>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {articles.length}
          </div>
          <div className="text-gray-600">文章总数</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {tags.length}
          </div>
          <div className="text-gray-600">标签数量</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {filteredAndSortedArticles.length}
          </div>
          <div className="text-gray-600">筛选结果</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <TagFilter
          tags={tags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          onClearAll={handleClearAllTags}
        />
      </motion.div>

      {/* Sort Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-wrap items-center gap-4"
      >
        <span className="text-gray-700 font-medium">排序方式:</span>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => {
            const Icon = option.icon
            const isActive = sortBy === option.value
            return (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-glow'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-card'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{option.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Articles Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        {filteredAndSortedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedArticles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              没有找到匹配的文章
            </h3>
            <p className="text-gray-600 mb-6">
              尝试调整筛选条件或清除所有标签
            </p>
            {selectedTags.length > 0 && (
              <button
                onClick={handleClearAllTags}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                清除所有筛选
              </button>
            )}
          </motion.div>
        )}
      </motion.section>
    </div>
  )
}

export default Articles
