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
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          关于我
        </h1>
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
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium font-mono text-sm"
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
        
        <div className="space-y-8">
          {timeline.map((item, index) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold font-mono text-sm">
                  {item.year.slice(-2)}
                </div>
              </div>
              <div className="flex-1 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
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
