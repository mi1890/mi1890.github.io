import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Code, Zap, Heart } from 'lucide-react'
import ArticleCard from '../components/ArticleCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useBlog } from '../context/BlogContext'

const Home = () => {
  const { articles, loading } = useBlog()
  const recentArticles = articles.slice(0, 3)

  if (loading) {
    return <LoadingSpinner text="正在加载最新文章..." />
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="gradient-text">Mi1890</span>
            <span className="text-gray-900">'s Blog</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            分享前端开发、技术思考和编程经验的个人博客。
            在这里记录我的技术成长之路。
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center space-x-2 text-gray-700">
              <Code className="w-5 h-5 text-blue-600" />
              <span className="font-medium">前端开发</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">技术分享</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-medium">热爱编程</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Articles Section */}
      <section className="space-y-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-3xl font-bold text-gray-900">最新文章</h2>
          <Link
            to="/articles"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300"
          >
            <span>查看全部</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {recentArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Code className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              即将开始分享
            </h3>
            <p className="text-gray-600">
              正在准备精彩的技术文章，敬请期待！
            </p>
          </motion.div>
        )}
      </section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white"
      >
        <h3 className="text-2xl font-bold mb-4">
          想要了解更多？
        </h3>
        <p className="text-blue-100 mb-6 max-w-lg mx-auto">
          欢迎浏览我的文章，或者通过关于页面了解更多关于我的信息。
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/articles"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-300"
          >
            浏览文章
          </Link>
          <Link
            to="/about"
            className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors duration-300"
          >
            了解我
          </Link>
        </div>
      </motion.section>
    </div>
  )
}

export default Home
