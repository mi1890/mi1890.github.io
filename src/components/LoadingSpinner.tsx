import React from 'react'
import { motion } from 'framer-motion'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface LoadingSpinnerProps {
  size?: SpinnerSize
  text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text = '加载中...' }) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  }

  // 创建骨架屏卡片
  const SkeletonCard = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl p-6 shadow-card"
    >
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton h-6 w-3/4 rounded mb-3" />
      <div className="space-y-2 mb-4">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-4 w-4/6 rounded" />
      </div>
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-4 w-16 rounded" />
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-8">
      {/* 加载动画 */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          {/* 外层光环 */}
          <motion.div
            className={`${sizeClasses[size]} absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20`}
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* 主旋转圆环 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`${sizeClasses[size]} border-3 border-blue-100 border-t-blue-600 rounded-full relative`}
          />
        </div>
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-500 font-medium text-sm"
          >
            {text}
          </motion.p>
        )}
      </div>

      {/* 骨架屏预览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard delay={0} />
        <SkeletonCard delay={0.1} />
        <SkeletonCard delay={0.2} />
      </div>
    </div>
  )
}

export default LoadingSpinner
