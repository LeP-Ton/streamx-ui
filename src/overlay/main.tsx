import React from 'react'
import ReactDOM from 'react-dom/client'
import { Overlay } from './Overlay'

// 展示页入口：直播软件浏览器源加载此页。
// 透明背景、铺满、只渲染不交互。
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Overlay />
  </React.StrictMode>,
)
