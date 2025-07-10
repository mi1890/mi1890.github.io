---
title: "JavaScript 异步编程模式"
date: "2024-01-10"
tags: ["JavaScript", "异步编程", "Promise"]
excerpt: "从回调函数到 Promise，再到 async/await，详细介绍 JavaScript 中的异步编程演进过程。"
---

# JavaScript 异步编程模式

JavaScript 的异步编程是现代 Web 开发的核心概念之一。本文将深入探讨 JavaScript 异步编程的演进历程，从早期的回调函数到现代的 async/await 语法。

## 为什么需要异步编程？

JavaScript 是单线程语言，如果所有操作都是同步的，那么长时间运行的操作（如网络请求、文件读取）会阻塞整个程序的执行。异步编程允许程序在等待某些操作完成时继续执行其他代码。

## 回调函数时代

在早期的 JavaScript 中，回调函数是处理异步操作的主要方式。

```javascript
// 传统的回调函数方式
function fetchData(callback) {
  setTimeout(() => {
    const data = { id: 1, name: 'John' }
    callback(null, data)
  }, 1000)
}

fetchData((error, data) => {
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Data:', data)
  }
})
```

### 回调地狱

当需要处理多个连续的异步操作时，回调函数会导致代码深度嵌套，形成"回调地狱"：

```javascript
// 回调地狱示例
getData((err, a) => {
  if (err) throw err
  getMoreData(a, (err, b) => {
    if (err) throw err
    getMoreData(b, (err, c) => {
      if (err) throw err
      getMoreData(c, (err, d) => {
        // 继续嵌套...
      })
    })
  })
})
```

## Promise 的崛起

ES6 引入的 Promise 解决了回调地狱的问题，提供了更优雅的异步编程方式。

### Promise 基础

```javascript
// 创建 Promise
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.5
      if (success) {
        resolve({ id: 1, name: 'John' })
      } else {
        reject(new Error('Failed to fetch data'))
      }
    }, 1000)
  })
}

// 使用 Promise
fetchData()
  .then(data => {
    console.log('Success:', data)
    return data.id
  })
  .then(id => {
    console.log('ID:', id)
  })
  .catch(error => {
    console.error('Error:', error)
  })
  .finally(() => {
    console.log('Operation completed')
  })
```

### Promise 链式调用

Promise 的 `.then()` 方法返回新的 Promise，允许链式调用：

```javascript
fetchUserData()
  .then(user => fetchUserPosts(user.id))
  .then(posts => fetchPostComments(posts[0].id))
  .then(comments => {
    console.log('Comments:', comments)
  })
  .catch(error => {
    console.error('Error in chain:', error)
  })
```

### Promise 工具方法

```javascript
// Promise.all - 并行执行，全部成功才成功
Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
]).then(([user, posts, comments]) => {
  console.log('All data loaded:', { user, posts, comments })
})

// Promise.race - 返回最先完成的 Promise
Promise.race([
  fetchFromServer1(),
  fetchFromServer2()
]).then(data => {
  console.log('First response:', data)
})

// Promise.allSettled - 等待所有 Promise 完成，无论成功或失败
Promise.allSettled([
  fetchData1(),
  fetchData2(),
  fetchData3()
]).then(results => {
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`Task ${index} succeeded:`, result.value)
    } else {
      console.log(`Task ${index} failed:`, result.reason)
    }
  })
})
```

## async/await 语法糖

ES2017 引入的 async/await 让异步代码看起来更像同步代码，进一步提升了代码的可读性。

### 基本用法

```javascript
// 使用 async/await
async function loadUserData() {
  try {
    const user = await fetchUser()
    const posts = await fetchUserPosts(user.id)
    const comments = await fetchPostComments(posts[0].id)
    
    return {
      user,
      posts,
      comments
    }
  } catch (error) {
    console.error('Error loading data:', error)
    throw error
  }
}

// 调用 async 函数
loadUserData()
  .then(data => console.log('Data loaded:', data))
  .catch(error => console.error('Failed to load data:', error))
```

### 并行执行

```javascript
// 并行执行多个异步操作
async function loadAllData() {
  try {
    // 同时发起多个请求
    const [user, posts, settings] = await Promise.all([
      fetchUser(),
      fetchPosts(),
      fetchSettings()
    ])
    
    return { user, posts, settings }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### 错误处理

```javascript
async function robustDataLoader() {
  try {
    const user = await fetchUser()
    
    // 处理可能失败的操作
    let posts = []
    try {
      posts = await fetchUserPosts(user.id)
    } catch (postError) {
      console.warn('Failed to load posts:', postError)
      // 使用默认值或降级处理
    }
    
    return { user, posts }
  } catch (error) {
    console.error('Critical error:', error)
    throw error
  }
}
```

## 现代异步模式

### 异步迭代器

```javascript
// 异步生成器
async function* dataStream() {
  for (let i = 0; i < 5; i++) {
    const data = await fetchData(i)
    yield data
  }
}

// 使用异步迭代器
async function processStream() {
  for await (const data of dataStream()) {
    console.log('Processing:', data)
  }
}
```

### AbortController

```javascript
// 可取消的异步操作
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController()
  
  // 设置超时
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request was aborted')
    }
    throw error
  }
}
```

## 最佳实践

### 1. 合理选择异步模式

```javascript
// 简单的单个异步操作：Promise
function simpleAsync() {
  return fetch('/api/data').then(r => r.json())
}

// 复杂的多步异步操作：async/await
async function complexAsync() {
  const user = await fetchUser()
  const profile = await fetchProfile(user.id)
  const permissions = await fetchPermissions(user.role)
  
  return { user, profile, permissions }
}
```

### 2. 错误处理策略

```javascript
async function robustOperation() {
  const results = await Promise.allSettled([
    operation1(),
    operation2(),
    operation3()
  ])
  
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
  
  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason)
  
  if (failed.length > 0) {
    console.warn('Some operations failed:', failed)
  }
  
  return successful
}
```

### 3. 避免常见陷阱

```javascript
// ❌ 忘记等待 Promise
async function badExample() {
  const data = fetchData() // 没有 await
  console.log(data) // 打印的是 Promise 对象
}

// ✅ 正确等待 Promise
async function goodExample() {
  const data = await fetchData()
  console.log(data) // 打印实际数据
}

// ❌ 在循环中串行执行
async function slowLoop(items) {
  const results = []
  for (const item of items) {
    const result = await processItem(item) // 串行执行
    results.push(result)
  }
  return results
}

// ✅ 并行执行
async function fastLoop(items) {
  const promises = items.map(item => processItem(item))
  return Promise.all(promises)
}
```

## 总结

JavaScript 异步编程从回调函数发展到 Promise，再到 async/await，每一步都在提升代码的可读性和可维护性。理解这些模式的特点和适用场景，能帮助我们写出更好的异步代码。

在实际开发中，要根据具体需求选择合适的异步模式，同时注意错误处理和性能优化。掌握这些异步编程技巧，是成为优秀 JavaScript 开发者的必经之路。
