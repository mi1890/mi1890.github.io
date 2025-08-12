# Markdown 语法参考手册

这是一个快速的 Markdown 语法参考，包含了博客写作中常用的语法。

## 文档头部信息 (Front Matter)

```yaml
---
title: "文章标题"
date: "2025-01-01"
tags: ["标签1", "标签2", "标签3"]
excerpt: "文章摘要描述"
---
```

## 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

## 文本格式

```markdown
**粗体文本**
*斜体文本*
***粗斜体文本***
~~删除线~~
`行内代码`
```

**粗体文本**
*斜体文本*
***粗斜体文本***
~~删除线~~
`行内代码`

## 列表

### 无序列表
```markdown
- 项目1
- 项目2
  - 子项目1
  - 子项目2
- 项目3
```

- 项目1
- 项目2
  - 子项目1
  - 子项目2
- 项目3

### 有序列表
```markdown
1. 第一项
2. 第二项
   1. 子项目1
   2. 子项目2
3. 第三项
```

1. 第一项
2. 第二项
   1. 子项目1
   2. 子项目2
3. 第三项

## 链接

```markdown
[链接文本](https://example.com)
[链接文本](https://example.com "链接标题")
<https://example.com>
```

[链接文本](https://example.com)
[链接文本](https://example.com "链接标题")
<https://example.com>

## 图片

```markdown
![图片描述](图片URL)
![图片描述](图片URL "图片标题")

# 本地图片 (放在 posts/images/ 目录下)
![本地图片](/images/image-name.jpg)

# 网络图片
![网络图片](https://example.com/image.jpg)
```

## 代码块

### 行内代码
```markdown
这是一个 `变量名` 的示例。
```

### 代码块
````markdown
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```
````

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```

### 支持的语言高亮
- `javascript` / `js`
- `typescript` / `ts`
- `python` / `py`
- `java`
- `c` / `cpp`
- `html`
- `css`
- `json`
- `yaml`
- `markdown` / `md`
- `bash` / `shell`
- `sql`
- `xml`

## 引用

```markdown
> 这是一个引用块。
> 
> 可以包含多行文本。
> 
> > 这是嵌套引用。
```

> 这是一个引用块。
> 
> 可以包含多行文本。
> 
> > 这是嵌套引用。

## 表格

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 行1 | 数据1 | 数据2 |
| 行2 | 数据3 | 数据4 |

# 对齐方式
| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:-------:|-------:|
| 左     | 中       | 右     |
```

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 行1 | 数据1 | 数据2 |
| 行2 | 数据3 | 数据4 |

## 分割线

```markdown
---
***
___
```

---

## 任务列表

```markdown
- [x] 已完成的任务
- [ ] 未完成的任务
- [ ] 另一个任务
```

- [x] 已完成的任务
- [ ] 未完成的任务
- [ ] 另一个任务

## 脚注

```markdown
这是一个脚注示例[^1]。

[^1]: 这是脚注的内容。
```

## 特殊字符转义

```markdown
\*不是斜体\*
\`不是代码\`
\# 不是标题
\[不是链接\]
```

## 数学公式 (如果支持)

```markdown
行内公式：$E = mc^2$

块级公式：
$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$
```

## HTML 标签

Markdown 支持嵌入 HTML 标签：

```html
<div align="center">
  <strong>居中的粗体文本</strong>
</div>

<details>
<summary>点击展开</summary>
这是折叠的内容。
</details>
```

## 常用快捷键 (编辑器相关)

- `Ctrl + B` - 粗体
- `Ctrl + I` - 斜体
- `Ctrl + K` - 插入链接
- `Ctrl + Shift + K` - 插入代码块
- `Ctrl + Shift + L` - 插入列表

## 博客写作建议

1. **文章结构清晰**：使用合适的标题层级
2. **代码高亮**：为代码块指定正确的语言
3. **图片优化**：使用描述性的 alt 文本
4. **链接有效**：确保外部链接可访问
5. **内容完整**：包含必要的 front matter 信息
6. **标签合理**：选择准确的标签便于分类

## 本地图片使用指南

1. 将图片放在 `posts/images/` 目录下
2. 在 Markdown 中使用：`![描述](/images/filename.jpg)`
3. 支持的图片格式：`.jpg`, `.png`, `.gif`, `.webp`, `.svg`
4. 建议图片大小：宽度不超过 800px，文件大小不超过 1MB

## 示例文章参考

可以参考 `posts/` 目录下的示例文章： 
- `how-to-use-images-in-blog.md` - 图片使用示例
- `react-best-practices.md` - 技术文章示例
- `javascript-async-patterns.md` - 代码示例较多的文章
