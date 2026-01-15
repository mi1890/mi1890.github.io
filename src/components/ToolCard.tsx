import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { Tool } from '../types'

interface ToolCardProps {
  tool: Tool
  index?: number
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, index = 0 }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card card-hover p-4 flex items-start gap-4"
    >
      {/* Preview Image */}
      <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
        {tool.preview ? (
          <img
            src={tool.preview}
            alt={tool.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Preview
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          <a
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors duration-300 flex items-center gap-2"
          >
            {tool.title}
            <ExternalLink className="w-4 h-4" />
          </a>
        </h2>
        <p className="text-gray-600 line-clamp-3">
          {tool.description}
        </p>
      </div>
    </motion.article>
  )
}

export default ToolCard
