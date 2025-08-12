import React from 'react'
import configManager from '../config/index'
import CommentSection from './CommentSection'

interface CommentsProps {
  articleSlug: string
  articleTitle?: string
}

const Comments: React.FC<CommentsProps> = ({ articleSlug, articleTitle }) => {
  const commentsConfig = configManager.getCommentsConfig()

  if (!commentsConfig?.enabled) {
    return null
  }

  // 只支持 Giscus
  return <CommentSection articleSlug={articleSlug} articleTitle={articleTitle} />
}

export default Comments
