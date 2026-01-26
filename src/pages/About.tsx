import React from 'react'
import { motion } from 'framer-motion'
import { Code, Coffee, Heart, Github, Mail, MapPin,Gamepad } from 'lucide-react'
import configManager from '../config/index'

const About: React.FC = () => {
  // 从配置文件获取数据
  let authorInfo, skills, interests, timeline
  
  try {
    authorInfo = configManager.getAuthorInfo()
    skills = configManager.getSkills()
    interests = configManager.getInterests()
    timeline = configManager.getTimeline()
  } catch (error) {
    console.error('配置加载失败:', error)
    return <div className="text-center py-12">配置加载失败</div>
  }
  
  // 图标映射
  const iconMap: Record<string, React.ComponentType<any>> = {
    Code,
    Coffee,
    Heart,
    Github,
    Mail,
    MapPin,
    Gamepad,
  } as const

  if (!authorInfo || !skills || !interests || !timeline) {
    return <div className="text-center py-12">配置加载中...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header - 增强视觉效果 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative py-4"
      >
        {/* 装饰性背景 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-40 h-40 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute top-8 right-1/4 w-32 h-32 bg-purple-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-36 h-36 bg-pink-100/30 rounded-full blur-3xl transform -translate-x-1/2" />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-block mb-4"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-colored">
            <Code className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        <motion.h1 
          className="text-4xl font-bold text-gray-900 mb-4"
          whileHover={{ scale: 1.02 }}
        >
          关于我
        </motion.h1>
        <p className="text-xl text-gray-600">
          {authorInfo.subtitle}
        </p>
      </motion.section>

      {/* Personal Info */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card p-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              你好，我是 {authorInfo.name}
            </h2>
            
            <div className="prose text-gray-600 space-y-4">
              <p>
                {authorInfo.description}
              </p>
              
              {authorInfo.bio.map((paragraph, index) => (
                <p key={index}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4">
              {authorInfo.contacts.map((contact: any, index: number) => {
                const Icon = iconMap[contact.icon]
                return (
                  <a
                    key={index}
                    href={contact.url}
                    target={contact.type === 'github' ? '_blank' : undefined}
                    rel={contact.type === 'github' ? 'noopener noreferrer' : undefined}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{contact.label}</span>
                  </a>
                )
              })}
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{authorInfo.location}</span>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              我的兴趣
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {interests.map((interest: any, index: number) => {
                const Icon = iconMap[interest.icon]
                
                // 定义颜色映射
                const colorClasses: Record<string, string> = {
                  blue: 'bg-blue-50 text-blue-600',
                  green: 'bg-green-50 text-green-600',
                  red: 'bg-red-50 text-red-600',
                  purple: 'bg-purple-50 text-purple-600'
                }
                
                const colorClass = colorClasses[interest.color] || 'bg-gray-50 text-gray-600'
                const [bgClass, textClass] = colorClass.split(' ')
                
                return (
                  <div key={index} className={`flex items-center space-x-3 p-4 ${bgClass} rounded-lg`}>
                    <Icon className={`w-8 h-8 ${textClass}`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{interest.name}</h4>
                      <p className="text-sm text-gray-600">{interest.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Skills */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="card p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          技能栈
        </h2>
        
        <div className="flex flex-wrap gap-3">
          {skills.map((skill, index) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
              whileHover={{ 
                scale: 1.1, 
                y: -3,
                boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)'
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium font-mono text-sm cursor-default shadow-md hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </motion.section>

      {/* Timeline */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="card p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          成长轨迹
        </h2>
        
        <div className="space-y-8 relative">
          {/* 连接线 */}
          <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-600 via-purple-500 to-blue-400" />
          
          {timeline.map((item, index) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              className="flex gap-6 relative group"
            >
              <motion.div 
                className="flex-shrink-0 relative z-10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold font-mono text-sm shadow-colored group-hover:shadow-lg transition-shadow">
                  {item.year.slice(-2)}
                </div>
              </motion.div>
              <div className="flex-1 pb-8 pt-1">
                <motion.h3 
                  className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  {item.title}
                </motion.h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}

export default About
