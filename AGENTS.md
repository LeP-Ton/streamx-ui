# AGENTS.md — streamx-ui 项目认知（给 AI 看的 README）

> 当前全貌，非时间线日志。认知演进细节见 git 历史与 `.agentdocs/workflow/`。

## 检索方法

1. 先读本文件获取项目全貌。
2. 需要变更背景时检索 `.agentdocs/index.md` 根索引，按需读对应变更文档。
3. 不全量检索 `.agentdocs/workflow/`；回滚/追溯才用 `git log`。

## 项目定位

纯前端直播 UI 系统：可视化配置直播内容/特效/弹窗，实时推送到直播软件浏览器源，营造氛围、打造 IP、宣传频道/广告。**核心约束：本地使用 + 直播中改配置即时生效。**

## 核心架构

```
配置页(5173) --POST--> 本地Node服务(3001) --WS广播--> 展示页(overlay.html，直播软件加载)
                            |
                            +--HTTP /config 兜底--> 展示页(轮询降级)
```

**为什么有本地服务**：直播软件浏览器源是独立进程，与配置页不共享内存，纯前端通道（localStorage/BroadcastChannel）跨不过去。本地服务当中间人转发配置。

**双通道 + 自动降级**：展示页优先 WebSocket（实时），连不上/断开自动降级 HTTP 轮询（`src/lib/client.ts`）。这是应对「抖音直播助手 WebSocket 支持未知」的关键设计。

## 技术选型

Vite + React 18 + TypeScript + ws。无数据库，配置内存态。

## 关键模块与边界

- `server/index.js`：本地服务，WebSocket(`/ws`) + HTTP(`/config`、`/health`)，仅监听 127.0.0.1。
- `src/lib/client.ts`：服务客户端。`pushConfig` 写入，`subscribeConfig` 订阅（含 WS→轮询降级与重连）。
- `src/store/types.ts`：配置数据模型。**新增直播元素类型时在此 union 扩分支**，并在 `LayerView` 与 `LayerEditor` 补对应渲染/编辑。
- `src/overlay/`：展示页，只渲染不交互，透明背景。
- `src/editor/`：配置面板，左图层列表 + 中预览 + 右属性编辑。
- `src/components/layers/`：各图层渲染组件。
- `compat.html`：直播软件兼容性自测页（JS/fetch/WebSocket/定时器），用于实测抖音直播助手等闭源软件的能力。

## 运行方式

```bash
npm install
npm run dev      # 同时起本地服务(3001)与前端(5173)
```

入口：配置面板 `/`、展示页 `/overlay.html`、自测页 `/compat.html`。

## 关键约定

- 直播软件兼容性以 OBS 为确定目标；抖音直播助手等闭源软件需用 `compat.html` 实测，不可假设支持 WebSocket。
- 配置画布默认 1920×1080，需与直播软件浏览器源分辨率一致。
- 展示页透明背景，禁滚动条；直播软件需开启浏览器源透明选项。
