import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/mi1890.github.io/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
