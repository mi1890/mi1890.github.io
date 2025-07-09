import React, { useEffect, useRef } from 'react'
import configManager from '../config/index.jsx'

const CommentSection = ({ articleId, articleTitle }) => {
  const commentRef = useRef(null)

  useEffect(() => {
    const commentsConfig = configManager.getCommentsConfig()
    
    if (!commentsConfig?.enabled || !commentsConfig.giscus) {
      return
    }

    const { giscus } = commentsConfig

    // Giscus 配置
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', giscus.repo)
    script.setAttribute('data-repo-id', giscus.repoId)
    script.setAttribute('data-category', giscus.category)
    script.setAttribute('data-category-id', giscus.categoryId)
    script.setAttribute('data-mapping', giscus.mapping)
    script.setAttribute('data-strict', giscus.strict)
    script.setAttribute('data-reactions-enabled', giscus.reactionsEnabled)
    script.setAttribute('data-emit-metadata', giscus.emitMetadata)
    script.setAttribute('data-input-position', giscus.inputPosition)
    script.setAttribute('data-theme', giscus.theme)
    script.setAttribute('data-lang', giscus.lang)
    script.setAttribute('data-loading', giscus.loading)
    script.crossOrigin = 'anonymous'
    script.async = true

    if (commentRef.current) {
      commentRef.current.appendChild(script)
    }

    return () => {
      if (commentRef.current) {
        commentRef.current.innerHTML = ''
      }
    }
  }, [articleId])

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">评论</h3>
      <div ref={commentRef} className="giscus-container" />
    </div>
  )
}

export default CommentSection
