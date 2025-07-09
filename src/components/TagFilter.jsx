import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, X } from 'lucide-react'

const TagFilter = ({ tags, selectedTags, onTagToggle, onClearAll }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayTags = isExpanded ? tags : tags.slice(0, 6)

  return (
    <div className="bg-white rounded-lg shadow-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Tag className="w-5 h-5 mr-2 text-blue-600" />
          标签筛选
        </h3>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors duration-300 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            清除全部
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {displayTags.map((tag) => {
            const isSelected = selectedTags.includes(tag)
            return (
              <motion.button
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTagToggle(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-glow'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {tag}
              </motion.button>
            )
          })}
        </AnimatePresence>

        {tags.length > 6 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-full text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors duration-300"
          >
            {isExpanded ? '收起' : `查看全部 (${tags.length})`}
          </button>
        )}
      </div>

      {selectedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-100"
        >
          <p className="text-sm text-gray-600">
            已选择 {selectedTags.length} 个标签: 
            <span className="font-medium text-blue-600 ml-1">
              {selectedTags.join(', ')}
            </span>
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default TagFilter
