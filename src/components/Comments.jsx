import React from 'react'
import configManager from '../config/index.jsx'
import CommentSection from './CommentSection.jsx'

const Comments = ({ articleId, articleTitle }) => {
  const commentsConfig = configManager.getCommentsConfig()

  if (!commentsConfig?.enabled) {
    return null
  }

  // 只支持 Giscus
  return <CommentSection articleId={articleId} articleTitle={articleTitle} />
}

export default Comments
