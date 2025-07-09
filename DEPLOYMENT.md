# 项目部署指南

## 🚀 快速开始

这个博客项目已经完全配置好，可以直接在 GitHub Pages 上部署。

### 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **访问网站**
   打开 http://localhost:5173

### 项目构建

```bash
npm run build     # 构建生产版本
npm run preview   # 预览构建结果
```

## 📝 添加新文章

### 1. 创建 Markdown 文件

在 `posts/` 目录下创建新的 `.md` 文件，文件名将作为文章的 slug。

```markdown
---
title: "文章标题"
date: "2024-01-15"
tags: ["标签1", "标签2", "标签3"]
excerpt: "文章摘要，简短描述文章内容"
---

# 文章内容

这里是文章的正文内容...
```

### 2. 更新文章数据

目前文章数据在 `src/context/BlogContext.jsx` 中手动管理。将来可以扩展为自动读取 `posts/` 目录中的文件。

### 3. 图片资源

将图片放在 `public/images/` 目录下，在 Markdown 中引用：

```markdown
![图片描述](/images/example.jpg)
```

## 🎨 自定义样式

### 主题颜色

在 `tailwind.config.js` 中修改主题颜色：

```javascript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',    // 主色调
      secondary: '#8B5CF6',  // 辅助色
    }
  }
}
```

### 字体

在 `index.html` 中添加新的字体链接，然后在 `tailwind.config.js` 中配置：

```javascript
fontFamily: {
  'sans': ['新字体', 'Inter', 'system-ui'],
}
```

## 🛠️ 功能扩展

### 添加评论系统

可以集成 Giscus、Utterances 或 Disqus：

```jsx
// 在 ArticleDetail.jsx 中添加
import Giscus from '@giscus/react'

<Giscus
  repo="username/repo"
  repoId="xxx"
  category="Announcements"
  categoryId="xxx"
  mapping="pathname"
  theme="light"
/>
```

### 添加搜索功能

当前的搜索是基于内存的。可以集成 Algolia DocSearch 或 Fuse.js 实现更强大的搜索。

### 添加深色模式

```jsx
// 添加深色模式切换
const [isDark, setIsDark] = useState(false)

useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, [isDark])
```

### RSS 订阅

可以添加 RSS feed 生成：

```javascript
// 在构建过程中生成 RSS
const generateRSS = (articles) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Mi1890's Blog</title>
    <description>个人技术博客</description>
    <link>https://mi1890.github.io</link>
    ${articles.map(article => `
      <item>
        <title>${article.title}</title>
        <description>${article.excerpt}</description>
        <link>https://mi1890.github.io/article/${article.slug}</link>
        <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      </item>
    `).join('')}
  </channel>
</rss>`
}
```

## 📊 SEO 优化

### Meta 标签

在每个页面组件中添加动态 meta 标签：

```jsx
import { Helmet } from 'react-helmet-async'

<Helmet>
  <title>{article.title} - Mi1890's Blog</title>
  <meta name="description" content={article.excerpt} />
  <meta property="og:title" content={article.title} />
  <meta property="og:description" content={article.excerpt} />
</Helmet>
```

### 结构化数据

添加 JSON-LD 结构化数据：

```jsx
const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": article.title,
  "description": article.excerpt,
  "author": {
    "@type": "Person",
    "name": "Mi1890"
  },
  "datePublished": article.date
}
```

## 🔧 性能优化

### 代码分割

已配置路由级别的代码分割。可以进一步优化：

```jsx
// 组件级别懒加载
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

### 图片优化

使用现代图片格式和响应式图片：

```jsx
<picture>
  <source srcSet="/images/hero.webp" type="image/webp" />
  <img src="/images/hero.jpg" alt="Hero" />
</picture>
```

### 缓存策略

在 `vite.config.js` 中配置缓存：

```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        router: ['react-router-dom'],
        ui: ['framer-motion', 'lucide-react']
      }
    }
  }
}
```

## 📈 分析工具

### Google Analytics

在 `index.html` 中添加 GA 代码：

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 性能监控

可以集成 Web Vitals 监控：

```jsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

## 🚀 部署

### GitHub Pages (推荐)

1. 确保项目在 GitHub 仓库中
2. 在仓库设置中启用 GitHub Pages
3. 选择 GitHub Actions 作为源
4. 推送代码后自动部署

### Netlify

1. 连接 GitHub 仓库
2. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`

### Vercel

1. 导入 GitHub 仓库
2. 自动检测构建设置
3. 一键部署

### 自定义域名

在 `public/` 目录下添加 `CNAME` 文件：

```
yourdomain.com
```

## 📦 依赖更新

定期更新依赖：

```bash
npm update
npm audit fix
```

检查过时的依赖：

```bash
npx npm-check-updates
```

## 🐛 常见问题

### 路由问题

如果部署后刷新页面出现 404，需要配置服务器重定向所有路由到 `index.html`。

### 构建失败

检查 Node.js 版本，推荐使用 Node.js 16+。

### 样式不生效

确保 Tailwind CSS 配置正确，检查 `content` 配置是否包含所有组件文件。

---

## 🎉 恭喜！

你的个人博客已经完全配置好了！现在可以开始写作和分享你的技术心得了。

如果有任何问题或需要帮助，请查看项目的 GitHub Issues 或 README 文档。
