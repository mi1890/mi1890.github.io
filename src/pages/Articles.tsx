import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, SortAsc, SortDesc } from 'lucide-react'
import ArticleCard from '../components/ArticleCard'
import TagFilter from '../components/TagFilter'
import LoadingSpinner from '../components/LoadingSpinner'
import Pagination from '../components/Pagination'
import { useBlog } from '../context/BlogContext'
import configManager from '../config/index'
import type { Article } from '../types'

const Articles: React.FC = () => {
  const { articles, tags, loading } = useBlog()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>('date-desc') // date-desc, date-asc, title
  const [currentPage, setCurrentPage] = useState<number>(1)
  
  // 从配置文件获取分页设置
  let paginationConfig, itemsPerPage
  
  try {
    paginationConfig = configManager.getPaginationConfig()
    itemsPerPage = paginationConfig.itemsPerPage
  } catch (error) {
    console.error('配置加载失败:', error)
    itemsPerPage = 30 // 默认值
  }

  // 筛选和排序文章
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles

    // 标签筛选
    if (selectedTags.length > 0) {
      filtered = articles.filter((article: Article) =>
        selectedTags.every(tag => article.tags.includes(tag))
      )
    }

    // 排序
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'title':
          return a.title.localeCompare(b.title, 'zh-CN')
        default:
          return 0
      }
    })

    return sorted
  }, [articles, selectedTags, sortBy])

  // 分页计算
  const totalPages = Math.ceil(filteredAndSortedArticles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentArticles = filteredAndSortedArticles.slice(startIndex, endIndex)

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
    // 标签筛选后重置到第一页
    setCurrentPage(1)
  }

  const handleClearAllTags = () => {
    setSelectedTags([])
    setCurrentPage(1)
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <div className="space-y-6">
      {/* Header - 减少高度 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-2"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          文章
        </h1>
        <p className="text-lg text-gray-600">
          分享技术心得与编程思考
        </p>
      </motion.section>

      {/* Stats & Sort Options - 合并到同一行 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col lg:flex-row gap-4 items-start lg:items-center lg:justify-between"
      >
        {/* 紧凑统计卡片 - 水平排列 */}
        <div className="card p-3 flex items-center gap-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-blue-600">{articles.length}</div>
            <div className="text-gray-600 text-xs">文章</div>
          </div>
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-green-600">{tags.length}</div>
            <div className="text-gray-600 text-xs">标签</div>
          </div>
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-purple-600">{filteredAndSortedArticles.length}</div>
            <div className="text-gray-600 text-xs">筛选</div>
          </div>
        </div>

        {/* 排序选项 */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-gray-700 font-medium text-sm">排序:</span>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => {
              const Icon = option.icon
              const isActive = sortBy === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 text-sm ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-glow'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-card'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="font-medium">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* 标签筛选 - 单独一行 */}
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

      {/* Articles Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {filteredAndSortedArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentArticles.map((article, index) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  index={index}
                />
              ))}
            </div>
            
            {/* 分页组件 */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredAndSortedArticles.length}
            />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
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
