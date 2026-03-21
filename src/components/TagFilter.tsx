import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, X } from 'lucide-react'

interface TagFilterProps {
  tags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClearAll: () => void
  noCard?: boolean
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTags, onTagToggle, onClearAll, noCard = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayTags = isExpanded ? tags : tags.slice(0, 6)

  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-gray-900 flex items-center">
          <Tag className="w-4 h-4 mr-1.5 text-blue-600" />
          标签筛选
          {selectedTags.length > 0 && (
            <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {selectedTags.length}
            </span>
          )}
        </h3>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors duration-300 flex items-center"
          >
            <X className="w-3 h-3 mr-0.5" />
            清除
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
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
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
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
            className="px-2.5 py-1 rounded-full text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors duration-300"
          >
            {isExpanded ? '收起' : `+${tags.length - 6}`}
          </button>
        )}
      </div>
    </>
  )

  if (noCard) {
    return content
  }

  return (
    <div className="bg-white rounded-lg shadow-card p-4">
      {content}
    </div>
  )
}

export default TagFilter
