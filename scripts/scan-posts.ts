import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 扫描 posts 目录下的所有 .md 文件
function scanPosts() {
  const postsDir = path.join(__dirname, '../posts');
  const publicPostsDir = path.join(__dirname, '../public/posts');
  const publicImagesDir = path.join(__dirname, '../public/images');
  
  // 确保 public/posts 和 public/images 目录存在
  if (!fs.existsSync(publicPostsDir)) {
    fs.mkdirSync(publicPostsDir, { recursive: true });
  }
  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }
  
  try {
    // 复制 posts/images 到 public/images
    const postsImagesDir = path.join(postsDir, 'images');
    if (fs.existsSync(postsImagesDir)) {
      const imageFiles = fs.readdirSync(postsImagesDir);
      imageFiles.forEach(imageFile => {
        const sourcePath = path.join(postsImagesDir, imageFile);
        const destPath = path.join(publicImagesDir, imageFile);
        
        // 检查是否是文件（不是目录）
        if (fs.statSync(sourcePath).isFile()) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`✓ 复制图片: ${imageFile}`);
        }
      });
    }
    
    const files = fs.readdirSync(postsDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    const articles = markdownFiles.map(file => {
      const slug = path.basename(file, '.md');
      
      // 复制文件到 public/posts
      const sourcePath = path.join(postsDir, file);
      const destPath = path.join(publicPostsDir, file);
      fs.copyFileSync(sourcePath, destPath);
      
      console.log(`✓ 复制文章: ${file}`);
      
      return {
        slug: slug,
        enabled: true
      };
    });
    
    const config = {
      articles: articles
    };
    
    // 写入配置文件到 public 目录（运行时使用）
    const publicConfigPath = path.join(__dirname, '../public/config/articles.json');
    const publicAppConfigPath = path.join(__dirname, '../public/config/config.json');
    
    // 确保目录存在
    const publicConfigDir = path.dirname(publicConfigPath);
    
    if (!fs.existsSync(publicConfigDir)) {
      fs.mkdirSync(publicConfigDir, { recursive: true });
    }
    
    // 写入文章配置文件
    fs.writeFileSync(publicConfigPath, JSON.stringify(config, null, 2));
    
    // 复制应用配置文件到 public 目录
    const srcAppConfigPath = path.join(__dirname, '../src/config/config.json');
    if (fs.existsSync(srcAppConfigPath)) {
      fs.copyFileSync(srcAppConfigPath, publicAppConfigPath);
      console.log(`✓ 复制配置文件: config.json`);
    }
    
    console.log(`✓ 生成配置文件: articles.json (public)`);
    console.log(`✓ 找到 ${articles.length} 篇文章`);
    
    return config;
  } catch (error) {
    console.error('扫描文章失败:', error);
    return null;
  }
}

// 如果直接运行此脚本
if (process.argv[1] && (process.argv[1].endsWith('scan-posts.js') || process.argv[1].endsWith('scan-posts.ts'))) {
  console.log('开始扫描文章...');
  scanPosts();
}

export { scanPosts };
