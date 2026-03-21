import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import configManager from '../config/index'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
  totalItems?: number
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  totalItems = 0
}) => {
  if (totalPages <= 1) return null

  // 从配置文件获取分页设置
  let paginationConfig, maxVisiblePages, defaultItemsPerPage
  
  try {
    paginationConfig = configManager.getPaginationConfig()
    maxVisiblePages = paginationConfig.maxVisiblePages
    defaultItemsPerPage = paginationConfig.itemsPerPage
  } catch (error) {
    console.error('配置加载失败:', error)
    maxVisiblePages = 7
    defaultItemsPerPage = 30
  }
  
  // 使用传入的 itemsPerPage 或默认值
  const actualItemsPerPage = itemsPerPage || defaultItemsPerPage

  const generatePageNumbers = () => {
    const pages = []
    
    if (totalPages <= maxVisiblePages) {
      // 如果总页数少于等于最大可见页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 复杂的分页逻辑
      if (currentPage <= 4) {
        // 当前页在前部
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // 当前页在后部
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 当前页在中间
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const pageNumbers = generatePageNumbers()

  const startItem = (currentPage - 1) * actualItemsPerPage + 1
  const endItem = Math.min(currentPage * actualItemsPerPage, totalItems)

  return (
    <div className="flex flex-col items-center space-y-4 mt-8">
      {/* 分页信息 */}
      <div className="text-sm text-gray-600">
        显示 {startItem} - {endItem} 项，共 {totalItems} 项
      </div>

      {/* 分页按钮 */}
      <div className="flex items-center space-x-2">
        {/* 上一页按钮 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-card'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">上一页</span>
        </button>

        {/* 页码按钮 */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <div className="flex items-center justify-center w-10 h-10 text-gray-400">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            ) : (
              <button
                onClick={() => onPageChange(typeof page === 'number' ? page : parseInt(page))}
                className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-glow'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-card'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* 下一页按钮 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-card'
          }`}
        >
          <span className="hidden sm:inline">下一页</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 页面跳转 */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600">跳转到</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          className="w-16 px-2 py-1 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const target = e.target as HTMLInputElement
              const page = parseInt(target.value)
              if (page >= 1 && page <= totalPages) {
                onPageChange(page)
                target.value = ''
              }
            }
          }}
          placeholder={currentPage.toString()}
        />
        <span className="text-gray-600">页</span>
      </div>
    </div>
  )
}

export default Pagination
