// 文章管理工具
// 用于从 markdown 文件中读取文章数据

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'posts')

export function getAllPosts() {
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter(name => name.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug,
        content,
        ...data,
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return allPostsData
}

export function getPostBySlug(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug,
    content,
    ...data,
  }
}

export function getAllTags() {
  const posts = getAllPosts()
  const allTags = posts.flatMap(post => post.tags || [])
  return [...new Set(allTags)]
}
