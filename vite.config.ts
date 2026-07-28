import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// streamx-ui 是一个「配置页 + 展示页」双入口的多页应用：
// - / (editor)：本地配置面板，编辑直播内容/特效/弹窗
// - /overlay.html (overlay)：直播软件浏览器源加载的展示页，只渲染不交互
// 开发期 Vite 起在 5173，本地 Node 服务起在 3001（WebSocket 推送 + HTTP 兜底）。
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        overlay: path.resolve(__dirname, 'overlay.html'),
      },
    },
  },
})
