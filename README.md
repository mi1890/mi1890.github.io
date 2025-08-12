
# Mi1890's Personal Blog

一个基于 React + TypeScript + Vite + Tailwind CSS 构建的现代化个人博客网站。

## ✨ 特性

- 🎨 **现代化设计**: 简洁优雅的 UI，使用 Card + 阴影设计语言
- 📱 **响应式布局**: 完美适配桌面端和移动端
- 🏷️ **标签系统**: 支持文章标签分类和筛选
- 🔍 **搜索功能**: 全文搜索，快速找到感兴趣的内容  
- ⚡ **性能优化**: 使用 Vite 构建，支持代码分割和懒加载
- 🎭 **流畅动画**: 使用 Framer Motion 提供丝滑的交互体验
- 📝 **Markdown 支持**: 原生支持 Markdown 格式文章
- 🌙 **字体优化**: 使用 JetBrains Mono 等编程字体
- 🔒 **类型安全**: 完整的 TypeScript 支持，提供更好的开发体验

## 🛠️ 技术栈

- **前端框架**: React 18
- **类型系统**: TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **路由管理**: React Router
- **动画库**: Framer Motion
- **Markdown**: React Markdown + remark-gfm
- **图标**: Lucide React
- **部署**: GitHub Pages

## 📁 项目结构

```
mi1890.github.io/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Layout.tsx      # 布局组件
│   │   ├── Header.tsx      # 头部导航
│   │   ├── Footer.tsx      # 页脚
│   │   ├── ArticleCard.tsx # 文章卡片
│   │   ├── TagFilter.tsx   # 标签筛选器
│   │   └── LoadingSpinner.tsx # 加载动画
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页
│   │   ├── About.tsx       # 关于页面
│   │   ├── Articles.tsx    # 文章列表
│   │   ├── Search.tsx      # 搜索页面
│   │   └── ArticleDetail.tsx # 文章详情
│   ├── context/            # 状态管理
│   │   └── BlogContext.tsx # 博客数据上下文
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts        # 全局类型定义
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── posts/                  # Markdown 文章
├── public/                # 静态资源
├── .github/workflows/     # GitHub Actions
└── ...配置文件
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/mi1890/mi1890.github.io.git
cd mi1890.github.io
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 类型检查

```bash
npm run type-check
```

### 5. 构建生产版本

```bash
npm run build
```

### 6. 预览构建结果

```bash
npm run preview
```

## 📝 写作指南

### 文章格式

在 `posts/` 目录下创建 Markdown 文件，文件头部需要包含 frontmatter：

```markdown
---
title: "文章标题"
date: "2024-01-15"
tags: ["标签1", "标签2", "标签3"]
excerpt: "文章摘要描述"
---

# 文章内容

这里是文章的正文内容...
```

### 支持的 Markdown 功能

- 标题和段落
- 代码块和行内代码
- 列表（有序和无序）
- 链接和图片
- 引用块
- 表格
- GitHub Flavored Markdown

### 标签建议

建议使用一致的标签命名：
- 技术相关：`JavaScript`、`React`、`CSS`、`Node.js`
- 类型相关：`前端开发`、`后端开发`、`全栈开发`
- 主题相关：`最佳实践`、`性能优化`、`工具推荐`

## 🎨 设计系统

### 颜色方案

- **主色调**: 蓝色渐变 (`blue-600` 到 `purple-600`)
- **中性色**: 灰色系列 (`gray-50` 到 `gray-900`)
- **强调色**: 红色 (`red-500`)、绿色 (`green-500`)、黄色 (`yellow-500`)

### 字体

- **正文**: Inter (无衬线字体)
- **代码**: JetBrains Mono (等宽字体)
- **标题**: Inter (加粗)

### 组件风格

- **卡片**: 圆角 + 阴影效果
- **按钮**: 圆角 + 悬停动画
- **输入框**: 简洁边框 + 聚焦效果
- **动画**: 流畅的过渡效果

## 🔧 自定义配置

### 修改个人信息

在以下文件中更新个人信息：

1. `src/context/BlogContext.jsx` - 文章数据
2. `src/pages/About.jsx` - 个人介绍
3. `src/components/Footer.jsx` - 联系方式
4. `index.html` - 网站标题

### 添加新页面

1. 在 `src/pages/` 创建新的页面组件
2. 在 `src/App.jsx` 中添加路由
3. 在 `src/components/Header.jsx` 中添加导航链接

## 📱 响应式设计

网站在以下设备上都有良好的显示效果：

- **桌面端**: >= 1024px
- **平板端**: 768px - 1023px  
- **手机端**: < 768px

使用 Tailwind CSS 的响应式前缀来适配不同屏幕：
- `sm:` - >= 640px
- `md:` - >= 768px
- `lg:` - >= 1024px
- `xl:` - >= 1280px

## 🚀 部署

### GitHub Pages

项目已配置 GitHub Actions 自动部署：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建并部署
3. 访问 `https://mi1890.github.io` 查看网站

### 手动部署

```bash
# 构建项目
npm run build

# 部署到其他平台
# 将 dist/ 目录上传到你的服务器
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📄 许可证

MIT License

## 🙏 致谢

感谢以下开源项目：

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

---

<div align="center">
  <p>Made with ❤️ by Mi1890</p>
  <p>Powered by React + Vite + Tailwind CSS</p>
</div>