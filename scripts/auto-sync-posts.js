import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 自动扫描并同步文章
 * 1. 扫描 posts 目录下的所有 .md 文件
 * 2. 复制到 public/posts 目录
 * 3. 生成 articles.json 配置文件
 * 4. 支持增量更新（只复制修改过的文件）
 */
function autoSyncPosts() {
  const postsDir = path.join(__dirname, '../posts');
  const publicPostsDir = path.join(__dirname, '../public/posts');
  const configPath = path.join(__dirname, '../src/config/articles.json');
  
  // 确保目录存在
  if (!fs.existsSync(publicPostsDir)) {
    fs.mkdirSync(publicPostsDir, { recursive: true });
    console.log('✓ 创建 public/posts 目录');
  }
  
  if (!fs.existsSync(postsDir)) {
    console.error('❌ posts 目录不存在');
    return null;
  }
  
  try {
    // 读取所有 markdown 文件
    const files = fs.readdirSync(postsDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    if (markdownFiles.length === 0) {
      console.warn('⚠️  posts 目录下没有找到 .md 文件');
      return null;
    }
    
    console.log(`📚 找到 ${markdownFiles.length} 篇文章`);
    
    const articles = [];
    let copiedCount = 0;
    let skippedCount = 0;
    
    for (const file of markdownFiles) {
      const slug = path.basename(file, '.md');
      const sourcePath = path.join(postsDir, file);
      const destPath = path.join(publicPostsDir, file);
      
      // 检查是否需要复制（比较修改时间）
      let needsCopy = true;
      if (fs.existsSync(destPath)) {
        const sourceStats = fs.statSync(sourcePath);
        const destStats = fs.statSync(destPath);
        needsCopy = sourceStats.mtime > destStats.mtime;
      }
      
      if (needsCopy) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✓ 复制: ${file}`);
        copiedCount++;
      } else {
        console.log(`⏭️  跳过: ${file} (无变更)`);
        skippedCount++;
      }
      
      // 验证文章格式（检查是否有 frontmatter）
      const content = fs.readFileSync(sourcePath, 'utf-8');
      const hasFrontmatter = content.startsWith('---');
      
      articles.push({
        slug: slug,
        enabled: true,
        hasFrontmatter: hasFrontmatter,
        lastModified: fs.statSync(sourcePath).mtime.toISOString()
      });
      
      if (!hasFrontmatter) {
        console.warn(`⚠️  ${file} 没有 frontmatter，可能无法正确解析`);
      }
    }
    
    // 生成配置文件
    const config = {
      articles: articles,
      lastSync: new Date().toISOString(),
      stats: {
        total: markdownFiles.length,
        copied: copiedCount,
        skipped: skippedCount
      }
    };
    
    // 确保配置目录存在
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    // 同时复制到 public 目录
    const publicConfigPath = path.join(__dirname, '../public/config/articles.json');
    const publicConfigDir = path.dirname(publicConfigPath);
    if (!fs.existsSync(publicConfigDir)) {
      fs.mkdirSync(publicConfigDir, { recursive: true });
    }
    fs.writeFileSync(publicConfigPath, JSON.stringify(config, null, 2));
    
    console.log(`✓ 更新配置文件: articles.json`);
    console.log(`📊 统计: 复制 ${copiedCount} 个，跳过 ${skippedCount} 个`);
    
    return config;
  } catch (error) {
    console.error('❌ 同步文章失败:', error);
    return null;
  }
}

// 如果直接运行此脚本
if (process.argv[1] && process.argv[1].endsWith('auto-sync-posts.js')) {
  console.log('🚀 开始自动同步文章...');
  const result = autoSyncPosts();
  
  if (result) {
    console.log('🎉 同步完成！');
  } else {
    console.log('💥 同步失败！');
    process.exit(1);
  }
}

export { autoSyncPosts };
