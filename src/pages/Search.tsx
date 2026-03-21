import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search as SearchIcon, X, Filter } from 'lucide-react'
import ArticleCard from '../components/ArticleCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useBlog } from '../context/BlogContext'
import type { Article } from '../types'

const Search: React.FC = () => {
  const { tags, loading, searchArticles } = useBlog()
  const [query, setQuery] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [isSearched, setIsSearched] = useState<boolean>(false)

  const searchResults = useMemo(() => {
    if (!query.trim() && !selectedTag) {
      return []
    }

    let results = searchArticles(query)
    
    if (selectedTag) {
      results = results.filter((article: Article) => article.tags.includes(selectedTag))
    }

    return results
  }, [query, selectedTag, searchArticles])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearched(true)
  }

  const handleClear = () => {
    setQuery('')
    setSelectedTag('')
    setIsSearched(false)
  }

  // 暂时注释掉未使用的函数，如果后续需要高亮功能可以启用
  // const highlightText = (text: string, query: string): React.ReactNode => {
  //   if (!query.trim()) return text

  //   const regex = new RegExp(`(${query})`, 'gi')
  //   const parts = text.split(regex)

  //   return parts.map((part: string, index: number) =>
  //     regex.test(part) ? (
  //       <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-1">
  //         {part}
  //       </mark>
  //     ) : (
  //       part
  //     )
  //   )
  // }

  if (loading) {
    return <LoadingSpinner text="正在准备搜索..." />
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
          搜索文章
        </h1>
        <p className="text-xl text-gray-600">
          查找你感兴趣的技术内容
        </p>
      </motion.section>

      {/* Search Form */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card p-6"
      >
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索文章标题、内容或标签..."
              className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tag Filter */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">标签筛选:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  !selectedTag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                全部
              </button>
              
              {tags.map((tag: string) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
            >
              <SearchIcon className="w-5 h-5" />
              <span>搜索</span>
            </button>
            
            {(query || selectedTag) && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300 font-medium"
              >
                <X className="w-5 h-5" />
                <span>清除</span>
              </button>
            )}
          </div>
        </form>
      </motion.section>

      {/* Search Results */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {isSearched && (query || selectedTag) ? (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                搜索结果
              </h2>
              <div className="text-gray-600">
                找到 <span className="font-semibold text-blue-600">{searchResults.length}</span> 篇文章
              </div>
            </div>

            {/* Results Grid */}
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((article: Article, index: number) => (
                  <div key={article.slug}>
                    <ArticleCard article={article} index={index} />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  没有找到相关文章
                </h3>
                <p className="text-gray-600 mb-6">
                  尝试使用不同的关键词或调整筛选条件
                </p>
                <button
                  onClick={handleClear}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  重新搜索
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              开始搜索文章
            </h3>
            <p className="text-gray-600">
              输入关键词或选择标签来查找你感兴趣的文章
            </p>
          </motion.div>
        )}
      </motion.section>
    </div>
  )
}

export default Search
