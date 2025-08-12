import React from 'react'
import { motion } from 'framer-motion'
import { Github, Mail, Heart } from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/mi1890',
      color: 'hover:text-gray-900'
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'mailto:contact@mi1890.dev',
      color: 'hover:text-blue-600'
    }
  ]

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col items-center space-y-4">
          {/* Social Links */}
          <div className="flex space-x-6">
            {socialLinks.map((link) => {
              const Icon = link.icon
              return (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg text-gray-600 ${link.color} transition-colors duration-300`}
                  aria-label={link.name}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              )
            })}
          </div>

          {/* Copyright */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>© {currentYear} Mi1890.</span>
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 animate-bounce-gentle" />
            <span>and</span>
            <span className="font-mono text-blue-600">React</span>
          </div>

          {/* Tech Stack */}
          <div className="text-xs text-gray-500 font-mono">
            Powered by React + Vite + Tailwind CSS
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
