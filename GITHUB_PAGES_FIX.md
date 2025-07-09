# GitHub Pages 部署问题修复总结

## 问题描述
在部署到 GitHub Pages 时遇到的主要问题：
1. **MIME 类型错误**: "Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/jsx'"
2. **多个构件错误**: "Multiple artifacts named 'github-pages' were unexpectedly found"

## 解决方案

### 1. 修复 MIME 类型问题

**问题原因**: 
- Vite 构建时 base 路径配置不正确
- JSON 配置文件通过 import 导入导致模块解析问题

**解决方法**:
- 修改 `vite.config.js` 中的 base 路径为 `/mi1890.github.io/`
- 将配置文件改为通过 fetch 动态加载，避免静态导入问题
- 根据环境自动切换基础路径（开发环境为空，生产环境为 GitHub Pages 路径）

### 2. 修复多构件问题

**问题原因**:
- 工作流程同时监听 push 和 pull_request 事件
- 分离的构建和部署作业可能创建重复构件
- 并发部署没有正确取消

**解决方法**:
- 移除 pull_request 触发器，只保留 push 到 master 分支
- 合并构建和部署为单一作业，避免构件传递问题
- 添加正确的并发控制配置

### 3. 动态文章管理

**改进**:
- 创建自动扫描脚本 `scripts/auto-sync-posts.js`，自动发现 posts 目录下的 markdown 文件
- 生成配置文件 `src/config/articles.json` 和 `public/config/articles.json`
- BlogContext 改为动态加载配置文件和文章内容
- 支持增量更新（只复制修改过的文件）

## 修改的文件

### 核心文件
- `vite.config.js` - 修复 base 路径配置
- `src/context/BlogContext.jsx` - 改为动态加载配置和文章
- `.github/workflows/deploy.yml` - 简化工作流程，修复多构件问题

### 新增文件
- `scripts/auto-sync-posts.js` - 自动同步文章脚本
- `scripts/scan-posts.js` - 文章扫描脚本（保留向后兼容）
- `public/config/articles.json` - 前端可访问的配置文件
- `src/config/articles.json` - 源配置文件

### 配置文件
- `package.json` - 添加 `scan-posts` 和 `prebuild` 脚本

## 工作流程

### 开发流程
1. 在 `posts/` 目录添加新的 markdown 文章
2. 运行 `npm run scan-posts` 或 `node scripts/auto-sync-posts.js`
3. 自动生成配置文件并复制文章到 public 目录
4. 运行 `npm run dev` 进行开发

### 部署流程
1. 推送到 master 分支
2. GitHub Actions 自动运行文章扫描
3. 构建项目
4. 部署到 GitHub Pages

## 关键特性

### 自动化
- 构建前自动扫描文章
- 增量复制（只更新修改过的文件）
- 自动生成配置文件

### 容错性
- 文章加载失败时使用 fallback 数据
- 配置文件加载失败时使用默认配置
- 环境自适应路径处理

### 可维护性
- 清晰的文件结构
- 详细的错误日志
- 模块化的脚本设计

## 验证方法

### 本地验证
```bash
npm run build
npm run preview
```

### 检查构建产物
- `dist/posts/` - 确保包含所有 markdown 文件
- `dist/config/` - 确保包含 articles.json
- `dist/index.html` - 确保路径包含正确的 base 前缀

### GitHub Pages 验证
- 访问部署的网站
- 检查文章列表是否正确加载
- 验证文章内容是否完整显示
- 确认搜索和标签功能正常

## 注意事项

1. **路径一致性**: 确保所有资源路径都使用相同的 base 路径
2. **环境变量**: 生产环境和开发环境的路径处理要一致
3. **构件名称**: 避免在同一工作流程中创建多个同名构件
4. **并发控制**: 确保同一时间只有一个部署在进行

这些修复应该能解决 GitHub Pages 部署的所有主要问题，并提供一个可靠的自动化部署流程。
