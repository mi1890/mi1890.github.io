import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Wrench } from 'lucide-react'
import type { Tool } from '../types'

interface ToolCardProps {
  tool: Tool
  index?: number
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, index = 0 }) => {
  const cardRef = useRef<HTMLElement>(null)

  // 处理鼠标移动，创建光效跟随效果
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    cardRef.current.style.setProperty('--mouse-x', `${x}%`)
    cardRef.current.style.setProperty('--mouse-y', `${y}%`)
  }

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      className="card card-hover p-5 flex items-start gap-5 group"
    >
      {/* Preview Image - 增强悬浮效果 */}
      <motion.div 
        className="flex-shrink-0 w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-inner"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {tool.preview ? (
          <img
            src={tool.preview}
            alt={tool.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Wrench className="w-8 h-8 text-gray-300" />
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          <a
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors duration-300 flex items-center gap-2 group/link"
          >
            <span className="link-underline">{tool.title}</span>
            <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transform -translate-x-2 group-hover/link:translate-x-0 transition-all duration-300" />
          </a>
        </h2>
        <p className="text-gray-600 line-clamp-3 leading-relaxed">
          {tool.description}
        </p>
        
        {/* 悬浮显示的操作提示 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <a
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>立即体验</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.span>
          </a>
        </motion.div>
      </div>
    </motion.article>
  )
}

export default ToolCard
