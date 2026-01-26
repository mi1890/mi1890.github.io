import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Code, Zap, Heart, Sparkles } from 'lucide-react'
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

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const Home: React.FC = () => {
  const { articles, loading } = useBlog()
  const recentArticles = articles.slice(0, 3)
  const siteConfig = config.getSiteInfo()

  if (loading) {
    return <LoadingSpinner text="正在加载最新文章..." />
  }

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section - 增强视觉效果 */}
      <motion.section 
        variants={itemVariants}
        className="relative text-center py-8 overflow-hidden"
      >
        {/* 装饰性背景元素 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-1/4 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl transform -translate-x-1/2" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          {/* 打招呼动画 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full text-sm text-blue-600 mb-2"
          >
            <Sparkles className="w-4 h-4 animate-pulse-soft" />
            <span>欢迎来到我的技术空间</span>
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-bold">
            <motion.span 
              className="gradient-text inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Mi1890
            </motion.span>
            <span className="text-gray-900">'s Blog</span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {siteConfig.hero.subtitle}
          </p>

          {/* 特性标签 - 增加交互 */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {siteConfig.hero.features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon as keyof typeof iconMap]
              const colorClass = colorMap[feature.color as keyof typeof colorMap]
              
              return (
                <motion.div 
                  key={index} 
                  className="flex items-center space-x-1.5 text-gray-700 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-100 cursor-default"
                  whileHover={{ 
                    scale: 1.08, 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    y: -2
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: index * 0.5 }}
                  >
                    <IconComponent className={`w-4 h-4 ${colorClass}`} />
                  </motion.div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </motion.section>

      {/* Featured Articles Section */}
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="flex items-center justify-between">
          <motion.h2 
            className="text-2xl font-bold text-gray-900 flex items-center gap-2"
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
            {siteConfig.sections.recentArticles.title}
          </motion.h2>
          <Link
            to="/articles"
            className="group inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-all duration-300"
          >
            <span>{siteConfig.sections.recentArticles.viewAllText}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

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
            <motion.div 
              className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Code className="w-10 h-10 text-gray-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {siteConfig.sections.recentArticles.emptyState.title}
            </h3>
            <p className="text-gray-600">
              {siteConfig.sections.recentArticles.emptyState.description}
            </p>
          </motion.div>
        )}
      </motion.section>

      {/* Call to Action - 增强视觉效果 */}
      <motion.section
        variants={itemVariants}
        className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-gradient rounded-2xl p-8 text-center text-white overflow-hidden"
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* 装饰性光效 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <motion.h3 
            className="text-2xl md:text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {siteConfig.sections.callToAction.title}
          </motion.h3>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            {siteConfig.sections.callToAction.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {siteConfig.sections.callToAction.buttons.map((button, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={button.link}
                  className={
                    button.type === 'primary'
                      ? "inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      : "inline-block border-2 border-white/80 text-white px-6 py-3 rounded-xl font-medium hover:bg-white hover:text-blue-600 transition-all duration-300"
                  }
                >
                  {button.text}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}

export default Home
