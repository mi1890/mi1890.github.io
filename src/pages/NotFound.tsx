import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-9xl font-black text-blue-600/10 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">页面不见了</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          抱歉，您访问的页面可能已被移动、删除，或者从未存在过。
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-glow hover:bg-blue-700 transition-all w-full sm:w-auto"
          >
            <Home className="w-5 h-5" />
            回到首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            返回上一页
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound
