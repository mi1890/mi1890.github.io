import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Code, Zap, Heart } from 'lucide-react'
import ArticleCard from '../components/ArticleCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { useBlog } from '../context/BlogContext'
import config from '../config'
import type { Article } from '../types'

const iconMap = {
  Code,
  Zap,
  Heart,
}

const colorMap = {
  blue: 'text-blue-600',
  yellow: 'text-yellow-500',
  red: 'text-red-500',
  purple: 'text-purple-600',
  green: 'text-green-600',
}

const Home: React.FC = () => {
  const { articles, loading } = useBlog()
  const recentArticles = articles.slice(0, 3)
  const siteConfig = config.getSiteInfo()

  if (loading) {
    return <LoadingSpinner text="正在加载最新文章..." />
  }

  return (
    <div className="space-y-6">
      {/* Hero Section - 进一步减少高度 */}
      <section className="text-center py-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-3"
        >
          <h1 className="text-2xl md:text-4xl font-bold">
            <span className="gradient-text">Mi1890</span>
            <span className="text-gray-900">'s Blog</span>
          </h1>
          
          <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {siteConfig.hero.subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {siteConfig.hero.features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon as keyof typeof iconMap]
              const colorClass = colorMap[feature.color as keyof typeof colorMap]
              
              return (
                <div key={index} className="flex items-center space-x-1.5 text-gray-700">
                  <IconComponent className={`w-3.5 h-3.5 ${colorClass}`} />
                  <span className="text-xs font-medium">{feature.text}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Featured Articles Section */}
      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-2xl font-bold text-gray-900">
            {siteConfig.sections.recentArticles.title}
          </h2>
          <Link
            to="/articles"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300"
          >
            <span>{siteConfig.sections.recentArticles.viewAllText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {recentArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article: Article, index: number) => (
              <ArticleCard
                key={article.slug}
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
              {siteConfig.sections.recentArticles.emptyState.title}
            </h3>
            <p className="text-gray-600">
              {siteConfig.sections.recentArticles.emptyState.description}
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
          {siteConfig.sections.callToAction.title}
        </h3>
        <p className="text-blue-100 mb-6 max-w-lg mx-auto">
          {siteConfig.sections.callToAction.description}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {siteConfig.sections.callToAction.buttons.map((button, index) => (
            <Link
              key={index}
              to={button.link}
              className={
                button.type === 'primary'
                  ? "bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-300"
                  : "border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors duration-300"
              }
            >
              {button.text}
            </Link>
          ))}
        </div>
      </motion.section>
    </div>
  )
}

export default Home
