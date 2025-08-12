# Giscus 评论系统设置指南

## 为什么选择 Giscus？

Giscus 是基于 GitHub Discussions 的评论系统，对于部署在 GitHub Pages 的静态网站来说是最佳选择：

- ✅ **安全**: 无需暴露任何密钥或敏感信息
- ✅ **免费**: 完全免费使用
- ✅ **功能丰富**: 支持嵌套回复、反应、Markdown 等
- ✅ **易于管理**: 基于 GitHub Discussions，便于管理
- ✅ **用户友好**: 支持 GitHub 账号登录

## 设置步骤

### 1. 启用 GitHub Discussions
1. 进入你的 GitHub 仓库
2. 点击 **Settings** 标签
3. 向下滚动到 **Features** 部分
4. 勾选 **Discussions** 复选框

### 2. 配置 Giscus
1. 访问 https://giscus.app/
2. 在 **Repository** 部分输入：`mi1890/mi1890.github.io`
3. 在 **Page ↔️ Discussions Mapping** 选择：`pathname`
4. 在 **Discussion Category** 选择或创建一个分类（推荐创建 "Comments" 分类）
5. 选择其他偏好设置：
   - **Features**: 建议启用反应
   - **Theme**: 选择 `light`
   - **Language**: 选择 `中文 (简体)`

### 3. 获取配置信息
在 giscus.app 页面底部，你会看到生成的配置，复制以下信息：
- `data-repo-id`
- `data-category-id`

### 4. 更新配置文件
打开 `src/config/config.json`，更新以下配置：

```json
{
  "comments": {
    "enabled": true,
    "giscus": {
      "repo": "mi1890/mi1890.github.io",
      "repoId": "你从giscus.app获取的REPO_ID",
      "category": "Comments",
      "categoryId": "你从giscus.app获取的CATEGORY_ID",
      "mapping": "pathname",
      "strict": "0",
      "reactionsEnabled": "1",
      "emitMetadata": "0",
      "inputPosition": "bottom",
      "theme": "light",
      "lang": "zh-CN",
      "loading": "lazy"
    }
  }
}
```

### 5. 部署和测试
1. 提交并推送更改到 GitHub
2. 等待 GitHub Pages 部署完成
3. 访问任意文章页面测试评论功能

## 配置选项说明

| 配置项 | 说明 | 可选值 |
|-------|------|--------|
| `enabled` | 是否启用评论系统 | `true` / `false` |
| `repo` | GitHub 仓库 | `owner/repo` |
| `repoId` | 仓库 ID | 从 giscus.app 获取 |
| `category` | Discussion 分类名称 | 字符串 |
| `categoryId` | 分类 ID | 从 giscus.app 获取 |
| `mapping` | 页面映射方式 | `pathname` / `url` / `title` |
| `strict` | 严格匹配 | `0` / `1` |
| `reactionsEnabled` | 启用反应 | `0` / `1` |
| `inputPosition` | 输入框位置 | `top` / `bottom` |
| `theme` | 主题 | `light` / `dark` / `auto` |
| `lang` | 语言 | `zh-CN` / `en` 等 |

## 样式自定义

你可以通过 CSS 自定义评论区域的样式：

```css
/* 自定义 Giscus 容器样式 */
.giscus-container {
  margin-top: 2rem;
}

/* 自定义 Giscus iframe 样式 */
.giscus-frame {
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .giscus-frame {
    border-color: #374151;
  }
}
```

## 主题切换支持

如果你的博客支持深色模式，可以动态切换评论系统主题：

```javascript
// 在主题切换时更新评论系统主题
const updateCommentsTheme = (theme) => {
  const iframe = document.querySelector('iframe.giscus-frame')
  if (iframe) {
    iframe.contentWindow.postMessage({
      giscus: {
        setConfig: {
          theme: theme === 'dark' ? 'dark' : 'light'
        }
      }
    }, 'https://giscus.app')
  }
}

// 监听主题变化
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'class') {
      const isDark = document.documentElement.classList.contains('dark')
      updateCommentsTheme(isDark ? 'dark' : 'light')
    }
  })
})

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class']
})
```

## 管理评论

### 查看和管理评论
1. 进入你的 GitHub 仓库
2. 点击 **Discussions** 标签
3. 在相应的分类下查看和管理评论

### 删除垃圾评论
1. 在 GitHub Discussions 中找到相应的讨论
2. 点击评论右上角的 "..." 菜单
3. 选择 "Delete comment" 删除垃圾评论

### 设置审核
1. 进入仓库设置
2. 在 **Moderation** 部分配置审核规则
3. 可以设置关键词过滤、举报阈值等

## 故障排除

### 常见问题

1. **评论不显示**
   - 检查仓库是否启用了 Discussions
   - 确认配置信息是否正确
   - 检查网络连接

2. **无法登录**
   - 确保用户有 GitHub 账号
   - 检查仓库是否为公开仓库
   - 确认用户有访问权限

3. **样式不正确**
   - 检查 CSS 冲突
   - 确认主题设置
   - 测试不同设备的显示效果

### 调试技巧
1. 打开浏览器开发者工具查看控制台错误
2. 检查 iframe 是否正确加载
3. 验证配置文件格式是否正确
4. 在 giscus.app 上重新生成配置

## 最佳实践

1. **性能优化**: 使用 `loading="lazy"` 延迟加载评论
2. **用户体验**: 设置合适的输入框位置和主题
3. **内容管理**: 定期检查和管理评论内容
4. **备份**: GitHub Discussions 会自动保存，无需额外备份
5. **隐私**: Giscus 不收集用户数据，只使用 GitHub 的身份验证
