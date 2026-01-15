import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Hammer } from 'lucide-react'
import ToolCard from '../components/ToolCard'
import LoadingSpinner from '../components/LoadingSpinner'
import Pagination from '../components/Pagination'
import type { Tool } from '../types'

interface ToolsConfig {
  tools: Tool[]
}

const Tools: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const basePath = import.meta.env.BASE_URL || '/'
        const configUrl = `${basePath}config/tools.json`
        const response = await fetch(configUrl)
        if (response.ok) {
          const data: ToolsConfig = await response.json()
          setTools(data.tools)
        } else {
          console.error('Failed to load tools config')
        }
      } catch (error) {
        console.error('Error loading tools:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Pagination logic
  const totalPages = Math.ceil(tools.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTools = tools.slice(startIndex, endIndex)

  if (loading) {
    return <LoadingSpinner text="正在加载工具列表..." />
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-2"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          工具箱
        </h1>
        <p className="text-lg text-gray-600">
          实用的小工具和项目展示
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {tools.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
              {currentTools.map((tool, index) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  index={index}
                />
              ))}
            </div>
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={tools.length}
            />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Hammer className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              暂无工具
            </h3>
            <p className="text-gray-600 mb-6">
              敬请期待更多精彩项目
            </p>
          </motion.div>
        )}
      </motion.section>
    </div>
  )
}

export default Tools
