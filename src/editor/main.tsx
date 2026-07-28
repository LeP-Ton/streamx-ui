import React from 'react'
import ReactDOM from 'react-dom/client'
import { Editor } from './Editor'
import '@/assets/animations.css'

// 配置页入口：本地访问，编辑直播内容/特效/弹窗并实时推送到展示页
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Editor />
  </React.StrictMode>,
)
