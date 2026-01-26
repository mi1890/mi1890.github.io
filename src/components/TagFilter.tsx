import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, X, ChevronDown, ChevronUp } from 'lucide-react'

interface TagFilterProps {
  tags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClearAll: () => void
  noCard?: boolean
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTags, onTagToggle, onClearAll, noCard = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayTags = isExpanded ? tags : tags.slice(0, 8)

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <motion.h3 
          className="text-base font-medium text-gray-900 flex items-center"
          whileHover={{ x: 3 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <Tag className="w-4 h-4 mr-2 text-blue-600" />
          </motion.div>
          标签筛选
          <AnimatePresence>
            {selectedTags.length > 0 && (
              <motion.span 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="ml-2 text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold"
              >
                {selectedTags.length}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.h3>
        <AnimatePresence>
          {selectedTags.length > 0 && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={onClearAll}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors duration-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50"
            >
              <X className="w-3 h-3" />
              清除全部
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {displayTags.map((tag, index) => {
            const isSelected = selectedTags.includes(tag)
            return (
              <motion.button
                key={tag}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTagToggle(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-colored'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                }`}
              >
                {isSelected && <span className="mr-1">✓</span>}
                {tag}
              </motion.button>
            )
          })}
        </AnimatePresence>

        {tags.length > 8 && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-300 flex items-center gap-1 border border-blue-200"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                +{tags.length - 8}
              </>
            )}
          </motion.button>
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
