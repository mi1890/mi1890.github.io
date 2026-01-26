import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Code, Home, User, FileText, Search, Hammer, LucideIcon } from 'lucide-react'

interface NavItem {
  name: string
  path: string
  icon: LucideIcon
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [scrolled, setScrolled] = useState<boolean>(false)
  const [scrollProgress, setScrollProgress] = useState<number>(0)
  const location = useLocation()

  const navItems: NavItem[] = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Articles', path: '/articles', icon: FileText },
    { name: 'Tools', path: '/tools', icon: Hammer },
    { name: 'About', path: '/about', icon: User },
    { name: 'Search', path: '/search', icon: Search },
  ]

  const isActive = (path: string): boolean => location.pathname === path

  // 监听滚动，添加滚动效果
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      
      // 计算滚动进度
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setScrollProgress(scrolled)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* 滚动进度条 */}
      <motion.div 
        className="scroll-progress"
        style={{ width: `${scrollProgress}%` }}
      />
      
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-card' 
          : 'bg-white shadow-card'
      }`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo - 增强悬浮效果 */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2 shadow-colored"
              >
                <Code className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold font-mono gradient-text">
                Mi1890
              </span>
            </Link>

            {/* Desktop Navigation - 增强交互 */}
            <nav className="hidden md:flex space-x-2">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        active
                          ? 'text-blue-600'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {/* 活动状态背景 */}
                      {active && (
                        <motion.div
                          layoutId="activeNavBg"
                          className="absolute inset-0 bg-blue-50 rounded-lg shadow-glow"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      {/* 悬浮背景 */}
                      {!active && (
                        <span className="absolute inset-0 bg-gray-50 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      )}
                      <Icon className={`w-4 h-4 relative z-10 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`} />
                      <span className="font-medium relative z-10">{item.name}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              aria-label={isMenuOpen ? '关闭菜单' : '打开菜单'}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile Navigation - 增强动效 */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="md:hidden overflow-hidden border-t border-gray-100"
              >
                <div className="py-4 space-y-1">
                  {navItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                            isActive(item.path)
                              ? 'bg-blue-50 text-blue-600 shadow-glow'
                              : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  )
}

export default Header
