import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ToolConfig {
  id: string;
  title: string;
  description: string;
  preview: string;
  link: string;
  date?: string;
}

function scanTools() {
  const toolsDir = path.join(__dirname, '../sub_project');
  const publicToolsImageDir = path.join(__dirname, '../public/images/tools');
  const publicToolsDir = path.join(__dirname, '../public/tools');
  const publicConfigDir = path.join(__dirname, '../public/config');

  if (!fs.existsSync(toolsDir)) {
    console.log('No sub_project directory found.');
    return;
  }

  // Ensure directories exist
  if (!fs.existsSync(publicToolsImageDir)) {
    fs.mkdirSync(publicToolsImageDir, { recursive: true });
  }
  if (!fs.existsSync(publicToolsDir)) {
    fs.mkdirSync(publicToolsDir, { recursive: true });
  }
  if (!fs.existsSync(publicConfigDir)) {
    fs.mkdirSync(publicConfigDir, { recursive: true });
  }

  const items = fs.readdirSync(toolsDir);
  const tools: ToolConfig[] = [];

  items.forEach(item => {
    const itemPath = path.join(toolsDir, item);
    if (fs.statSync(itemPath).isDirectory()) {
      const toolConfigPath = path.join(itemPath, 'tool.json');
      const packageJsonPath = path.join(itemPath, 'package.json');
      
      let toolData: any = {};
      let hasConfig = false;

      // Priority 1: tool.json
      if (fs.existsSync(toolConfigPath)) {
        try {
          const content = fs.readFileSync(toolConfigPath, 'utf-8');
          toolData = JSON.parse(content);
          hasConfig = true;
        } catch (e) {
          console.error(`Error reading tool.json for ${item}:`, e);
        }
      } 
      // Priority 2: package.json
      else if (fs.existsSync(packageJsonPath)) {
        try {
          const content = fs.readFileSync(packageJsonPath, 'utf-8');
          const pkg = JSON.parse(content);
          toolData = {
            title: pkg.name || item,
            description: pkg.description || '',
          };
          hasConfig = true;
        } catch (e) {
          console.error(`Error reading package.json for ${item}:`, e);
        }
      }

      if (hasConfig) {
        // Build and Deploy Sub-project
        try {
          console.log(`Building tool: ${item}...`);
          
          // Install dependencies if needed
          if (!fs.existsSync(path.join(itemPath, 'node_modules'))) {
             console.log(`Installing dependencies for ${item}...`);
             execSync('npm install', { cwd: itemPath, stdio: 'inherit' });
          }

          // Build
          execSync('npm run build', { cwd: itemPath, stdio: 'inherit' });

          // Copy dist to public/tools/item
          const distDir = path.join(itemPath, 'dist');
          const targetDir = path.join(publicToolsDir, item);
          
          if (fs.existsSync(distDir)) {
              if (fs.existsSync(targetDir)) {
                  fs.rmSync(targetDir, { recursive: true, force: true });
              }
              fs.mkdirSync(targetDir, { recursive: true });
              fs.cpSync(distDir, targetDir, { recursive: true });
              console.log(`✓ Deployed tool to: public/tools/${item}`);
          } else {
              console.error(`Build warning: No dist directory found for ${item}`);
          }
        } catch (e) {
          console.error(`Error building/deploying ${item}:`, e);
        }

        // Handle preview image
        let previewImage = '';
        if (toolData.preview) {
           const sourceImagePath = path.join(itemPath, toolData.preview);
           if (fs.existsSync(sourceImagePath)) {
             const ext = path.extname(sourceImagePath);
             const destImageName = `${item}${ext}`;
             const destImagePath = path.join(publicToolsImageDir, destImageName);
             fs.copyFileSync(sourceImagePath, destImagePath);
             previewImage = `/images/tools/${destImageName}`;
             console.log(`✓ Copied preview image for: ${item}`);
           }
        }

        // Add to list
        tools.push({
          id: item,
          title: toolData.title || item,
          description: toolData.description || 'No description available.',
          preview: previewImage,
          link: toolData.link || `/tools/${item}/index.html`, 
          date: toolData.date 
        });
        console.log(`✓ Found tool: ${item}`);
      }
    }
  });

  const config = {
    tools: tools
  };

  const publicToolsConfigPath = path.join(publicConfigDir, 'tools.json');
  fs.writeFileSync(publicToolsConfigPath, JSON.stringify(config, null, 2));
  console.log(`✓ Generated tools config: tools.json (public)`);
  console.log(`✓ Found ${tools.length} tools`);
}

// Run if called directly
if (process.argv[1] && (process.argv[1].endsWith('scan-tools.js') || process.argv[1].endsWith('scan-tools.ts'))) {
  console.log('Starting tools scan...');
  scanTools();
}

export { scanTools };
