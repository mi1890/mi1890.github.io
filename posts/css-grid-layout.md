---
title: "CSS Grid 布局完全指南"
date: "2024-01-05"
tags: ["CSS", "布局", "Grid"]
excerpt: "CSS Grid 是现代 Web 布局的强大工具，本文将详细介绍其使用方法和实际应用场景。"
---

# CSS Grid 布局完全指南

CSS Grid 是现代 Web 开发中最强大的布局工具之一。它提供了一个二维布局系统，让我们能够同时控制行和列的布局，比 Flexbox 更加灵活。

## Grid 基础概念

### 网格容器和网格项

```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px 200px;
  gap: 20px;
}

.item {
  background-color: #f0f0f0;
  padding: 20px;
}
```

### 基本术语

- **网格容器 (Grid Container)**: 设置了 `display: grid` 的元素
- **网格项 (Grid Item)**: 网格容器的直接子元素
- **网格线 (Grid Line)**: 分隔网格的线条
- **网格轨道 (Grid Track)**: 两条网格线之间的空间
- **网格单元 (Grid Cell)**: 最小的网格单位
- **网格区域 (Grid Area)**: 由多个网格单元组成的矩形区域

## 核心属性详解

### 容器属性

```css
.grid-container {
  display: grid;
  
  /* 定义列 */
  grid-template-columns: 200px 1fr 100px;
  /* 或使用 repeat() */
  grid-template-columns: repeat(3, 1fr);
  
  /* 定义行 */
  grid-template-rows: 100px auto 50px;
  
  /* 间距 */
  gap: 20px;
  /* 或分别设置 */
  row-gap: 20px;
  column-gap: 30px;
  
  /* 对齐方式 */
  justify-items: center;
  align-items: center;
  
  /* 容器内对齐 */
  justify-content: space-between;
  align-content: center;
}
```

### 项目属性

```css
.grid-item {
  /* 指定位置 */
  grid-column: 2 / 4;
  grid-row: 1 / 3;
  
  /* 或使用简写 */
  grid-area: 1 / 2 / 3 / 4;
  
  /* 自对齐 */
  justify-self: end;
  align-self: start;
}
```

## 实用布局模式

### 1. 响应式网格

```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
```

### 2. 圣杯布局

```css
.holy-grail {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main ads"
    "footer footer footer";
  grid-template-columns: 200px 1fr 150px;
  grid-template-rows: 60px 1fr 40px;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.ads { grid-area: ads; }
.footer { grid-area: footer; }
```

### 3. 卡片网格

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}
```

## 高级技巧

### 1. 网格线命名

```css
.grid {
  display: grid;
  grid-template-columns: 
    [sidebar-start] 250px 
    [sidebar-end main-start] 1fr 
    [main-end];
  grid-template-rows: 
    [header-start] 60px 
    [header-end content-start] 1fr 
    [content-end];
}

.sidebar {
  grid-column: sidebar-start / sidebar-end;
  grid-row: content-start / content-end;
}
```

### 2. 网格区域模板

```css
.layout {
  display: grid;
  grid-template-areas: 
    "logo nav nav"
    "sidebar content content"
    "sidebar footer footer";
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: 80px 1fr 60px;
}

@media (max-width: 768px) {
  .layout {
    grid-template-areas: 
      "logo"
      "nav"
      "content"
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

### 3. 子网格 (Subgrid)

```css
.main-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.sub-container {
  grid-column: span 2;
  display: grid;
  grid-template-columns: subgrid;
  gap: inherit;
}
```

## Grid vs Flexbox

| 特性 | Grid | Flexbox |
|------|------|---------|
| 维度 | 二维 (行和列) | 一维 (行或列) |
| 布局控制 | 明确的网格结构 | 内容驱动 |
| 对齐方式 | 更强大的对齐选项 | 简单的对齐 |
| 响应式 | 内置响应式能力 | 需要媒体查询 |
| 用途 | 页面整体布局 | 组件内部布局 |

## 实际应用场景

### 1. 文章布局

```css
.article-layout {
  display: grid;
  grid-template-columns: 1fr min(65ch, 100%) 1fr;
  grid-template-rows: auto auto 1fr auto;
}

.article-layout > * {
  grid-column: 2;
}

.full-bleed {
  grid-column: 1 / -1;
}
```

### 2. 图片画廊

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-auto-rows: 200px;
  gap: 15px;
}

.gallery-item:nth-child(3n) {
  grid-row: span 2;
}

.gallery-item:nth-child(5n) {
  grid-column: span 2;
}
```

### 3. 仪表板布局

```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 120px;
  gap: 20px;
}

.widget-small { grid-column: span 3; }
.widget-medium { grid-column: span 6; }
.widget-large { 
  grid-column: span 9; 
  grid-row: span 2; 
}
```

## 浏览器支持

CSS Grid 在现代浏览器中有很好的支持：

- Chrome 57+
- Firefox 52+
- Safari 10.1+
- Edge 16+

对于旧版浏览器，可以使用 `@supports` 提供降级方案：

```css
.container {
  /* Flexbox 降级方案 */
  display: flex;
  flex-wrap: wrap;
}

@supports (display: grid) {
  .container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 调试工具

### 浏览器开发者工具

- **Chrome DevTools**: 网格叠加层显示
- **Firefox**: 强大的网格检查器
- **Safari**: 网格徽章和叠加层

### CSS 属性

```css
.debug-grid {
  background-image: 
    linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

## 总结

CSS Grid 提供了前所未有的布局控制能力，让复杂的布局变得简单直观。虽然学习曲线相对陡峭，但掌握后能显著提升开发效率和代码质量。

在实际项目中，Grid 和 Flexbox 往往配合使用：Grid 负责页面整体布局，Flexbox 处理组件内部布局。这种组合能够应对绝大多数布局需求。

建议在新项目中积极使用 CSS Grid，它代表了 Web 布局的未来方向。
