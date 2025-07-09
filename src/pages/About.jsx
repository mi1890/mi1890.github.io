import React from 'react'
import { motion } from 'framer-motion'
import { Code, Coffee, Heart, Github, Mail, MapPin } from 'lucide-react'

const About = () => {
  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Node.js',
    'HTML/CSS', 'Tailwind CSS', 'Git', 'Webpack', 'Vite'
  ]

  const timeline = [
    {
      year: '2020',
      title: '开始前端开发之路',
      description: '从基础的 HTML/CSS/JavaScript 开始学习前端开发'
    },
    {
      year: '2021',
      title: '深入 React 生态',
      description: '学习 React、Redux、React Router 等相关技术栈'
    },
    {
      year: '2022',
      title: '全栈开发探索',
      description: '开始学习 Node.js、数据库等后端技术'
    },
    {
      year: '2023',
      title: '现代化工具链',
      description: '掌握 TypeScript、Vite、现代化构建工具'
    },
    {
      year: '2024',
      title: '持续学习成长',
      description: '专注于性能优化、架构设计和技术分享'
    }
  ]

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
          热爱编程的前端开发者，追求简洁优雅的代码
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
              你好，我是 Mi1890
            </h2>
            
            <div className="prose text-gray-600 space-y-4">
              <p>
                我是一名充满热情的前端开发者，专注于创建用户友好的网页应用。
                我相信技术应该为人服务，追求在功能与美观之间找到完美平衡。
              </p>
              
              <p>
                在编程之外，我喜欢分享技术心得，记录学习过程中的思考和感悟。
                这个博客就是我技术成长路上的见证和记录。
              </p>
              
              <p>
                我始终保持学习的热情，关注前端技术的最新发展，
                并努力将所学知识应用到实际项目中。
              </p>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/mi1890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a
                href="mailto:contact@mi1890.dev"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                <Mail className="w-5 h-5" />
                <span>Email</span>
              </a>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>中国</span>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              我的兴趣
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <Code className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">编程</h4>
                  <p className="text-sm text-gray-600">前端开发</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <Coffee className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900">咖啡</h4>
                  <p className="text-sm text-gray-600">提神利器</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                <Heart className="w-8 h-8 text-red-600" />
                <div>
                  <h4 className="font-medium text-gray-900">分享</h4>
                  <p className="text-sm text-gray-600">技术交流</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <Code className="w-8 h-8 text-purple-600" />
                <div>
                  <h4 className="font-medium text-gray-900">学习</h4>
                  <p className="text-sm text-gray-600">持续成长</p>
                </div>
              </div>
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
