import React from 'react'
import { motion } from 'framer-motion'
import { Github, Mail, Heart, Code, ArrowUp } from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/mi1890',
      color: 'hover:text-gray-900 hover:bg-gray-100'
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'mailto:contact@mi1890.dev',
      color: 'hover:text-blue-600 hover:bg-blue-50'
    }
  ]

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto relative">
      {/* 回到顶部按钮 */}
      <motion.button
        onClick={scrollToTop}
        className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-full p-2 shadow-md text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
        whileHover={{ y: -3, scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="回到顶部"
      >
        <ArrowUp className="w-4 h-4" />
      </motion.button>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo 和简介 */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-1.5">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-mono gradient-text">Mi1890</span>
          </motion.div>

          {/* Social Links */}
          <div className="flex space-x-4">
            {socialLinks.map((link) => {
              const Icon = link.icon
              return (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl text-gray-500 ${link.color} transition-all duration-300 border border-transparent hover:border-gray-200`}
                  aria-label={link.name}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              )
            })}
          </div>

          {/* Copyright */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>© {currentYear} Mi1890.</span>
            <span>Made with</span>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                ease: "easeInOut"
              }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            </motion.div>
            <span>and</span>
            <motion.span 
              className="font-mono text-blue-600"
              whileHover={{ scale: 1.1 }}
            >
              React
            </motion.span>
          </div>

          {/* Tech Stack - 增加交互 */}
          <motion.div 
            className="flex items-center gap-2 text-xs text-gray-400"
            initial={{ opacity: 0.5 }}
            whileHover={{ opacity: 1 }}
          >
            <span>Powered by</span>
            <div className="flex gap-1.5">
              {['React', 'Vite', 'Tailwind'].map((tech, index) => (
                <motion.span 
                  key={tech}
                  className="px-2 py-0.5 bg-gray-50 rounded-md font-mono text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-default"
                  whileHover={{ scale: 1.05, y: -1 }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
