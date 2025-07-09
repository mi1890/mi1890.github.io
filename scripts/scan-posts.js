import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 扫描 posts 目录下的所有 .md 文件
function scanPosts() {
  const postsDir = path.join(__dirname, '../posts');
  const publicPostsDir = path.join(__dirname, '../public/posts');
  
  // 确保 public/posts 目录存在
  if (!fs.existsSync(publicPostsDir)) {
    fs.mkdirSync(publicPostsDir, { recursive: true });
  }
  
  try {
    const files = fs.readdirSync(postsDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    const articles = markdownFiles.map(file => {
      const slug = path.basename(file, '.md');
      
      // 复制文件到 public/posts
      const sourcePath = path.join(postsDir, file);
      const destPath = path.join(publicPostsDir, file);
      fs.copyFileSync(sourcePath, destPath);
      
      console.log(`✓ 复制文件: ${file}`);
      
      return {
        slug: slug,
        enabled: true
      };
    });
    
    const config = {
      articles: articles
    };
    
    // 写入配置文件
    const configPath = path.join(__dirname, '../src/config/articles.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`✓ 生成配置文件: articles.json`);
    console.log(`✓ 找到 ${articles.length} 篇文章`);
    
    return config;
  } catch (error) {
    console.error('扫描文章失败:', error);
    return null;
  }
}

// 如果直接运行此脚本
if (process.argv[1] && process.argv[1].endsWith('scan-posts.js')) {
  console.log('开始扫描文章...');
  scanPosts();
}

export { scanPosts };
