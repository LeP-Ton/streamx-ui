# streamx-ui 变更文档索引

> 根索引：检索时先读本文件，按需读对应变更文档。不全量检索 `workflow/`。

## workflow/

- [20260728181600-init-scaffold.md](workflow/20260728181600-init-scaffold.md) — 初始化项目骨架：双入口 Vite + React + TS、本地 WebSocket 服务（含 HTTP 兜底）、配置页/展示页/图层组件、兼容性自测页
- [20260728201500-hotkey-trigger.md](workflow/20260728201500-hotkey-trigger.md) — 快捷键触发 UI：uiohook-napi 全局钩子（跨平台，Windows 主目标）、hotkeys 配置、trigger 广播、HotkeyPanel 录制、/test-trigger 测试端点
- [20260728210000-script-danmaku.md](workflow/20260728210000-script-danmaku.md) — 剧本人气系统：剧本弹幕编辑/定时调度/WS 广播/DanmakuLayer 渲染（Web Animations API）；修两个 bug：CSS 变量不可见、画布超视口

## 读取场景

- 想了解某次改动的「为什么」→ 读对应变更文档的「背景与目标」「约束与原则」。
- 想回滚某次改动 → 用 `git log --oneline` 定位 commit，`git revert`（见全局提示词 3.2）。
- 想了解项目当前全貌 → 读根目录 `AGENTS.md`。
