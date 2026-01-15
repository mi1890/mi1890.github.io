import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/tools/puzzle_tool/", // 这里的路径必须和部署时的文件夹名称一致
  plugins: [react()],
});
