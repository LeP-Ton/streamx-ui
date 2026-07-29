// streamx-ui 配置模型
// 配置页编辑这份结构 -> 推送到本地服务 -> 展示页按此渲染。
// 字段保持精简可扩展，新增组件类型时在下面追加 union 分支即可。

/** 位置与尺寸，单位均为像素，原点为展示页左上角 */
export interface LayerTransform {
  x: number
  y: number
  width: number
  height: number
  /** 0-100，透明度百分比 */
  opacity: number
  /** 0-360，旋转角度 */
  rotation: number
}

/** 图层类型：每加一种直播元素，在此 union 扩一个分支 */
export type LayerType = 'text' | 'image' | 'popup' | 'effect' | 'ticker'

/** 文字图层：标题、字幕、频道名、关注引导等 */
export interface TextLayer {
  id: string
  type: 'text'
  name: string
  transform: LayerTransform
  text: string
  fontSize: number
  color: string
  /** 是否带跑马灯滚动 */
  scroll: boolean
}

/** 图片图层：头像、logo、背景图 */
export interface ImageLayer {
  id: string
  type: 'image'
  name: string
  transform: LayerTransform
  src: string
  /** 是否圆形裁剪（头像常用） */
  circle: boolean
}

/** 弹窗图层：点赞飘心、关注提示、礼物特效等临时弹出 */
export interface PopupLayer {
  id: string
  type: 'popup'
  name: string
  transform: LayerTransform
  text: string
  color: string
  /** 弹出持续时间（毫秒） */
  duration: number
  /** 触发模式：manual=手动触发，auto=按间隔自动弹 */
  trigger: 'manual' | 'auto'
  /** auto 模式下的弹出间隔（毫秒） */
  interval: number
  /** manual 模式下绑定的快捷键，如 "Ctrl+Shift+1"，留空则只能通过 UI 手动触发 */
  hotkey?: string
}

/** 特效图层：粒子、光晕等氛围特效 */
export interface EffectLayer {
  id: string
  type: 'effect'
  name: string
  transform: LayerTransform
  /** 特效样式：粒子/光晕/烟花等，先用字符串占位，后续扩展枚举 */
  effect: string
  color: string
}

/** 跑马灯/滚动条图层：底部滚动文字 */
export interface TickerLayer {
  id: string
  type: 'ticker'
  name: string
  transform: LayerTransform
  text: string
  color: string
  bgColor: string
  speed: number
}

export type Layer =
  | TextLayer
  | ImageLayer
  | PopupLayer
  | EffectLayer
  | TickerLayer

/** 快捷键绑定：按组合键触发指定图层的显隐/弹出 */
export interface HotkeyBinding {
  /** 组合键字符串，如 "Ctrl+Shift+1"，修饰键用 Ctrl/Alt/Shift/Meta，主键用按键名 */
  combo: string
  /** 触发的目标图层 id */
  layerId: string
  /** 触发动作：show=显示，hide=隐藏，toggle=切换，popup=弹窗弹出一次 */
  action: 'show' | 'hide' | 'toggle' | 'popup'
}

/** 剧本弹幕条目：按时机自动发出的假弹幕，用于直播冷启动氛围营造 */
export interface ScriptDanmaku {
  id: string
  /** 弹幕文本 */
  text: string
  /** 弹幕颜色 */
  color: string
  /** 剧本启动后多少毫秒发出第一条 */
  delay: number
  /** 发送间隔：0=只发一次，>0=按间隔循环发送 */
  interval: number
}

/** 剧本人气系统：按时间表自动推送弹幕 */
export interface ScriptConfig {
  /** 总开关 */
  enabled: boolean
  /** 弹幕条目 */
  danmakus: ScriptDanmaku[]
}

/** 整份直播配置 */
export interface StreamConfig {
  /** 画布尺寸，需与直播软件浏览器源设置的分辨率一致 */
  canvas: {
    width: number
    height: number
  }
  layers: Layer[]
  /** 全局快捷键绑定，由本地服务的键盘钩子捕获后广播给展示页 */
  hotkeys: HotkeyBinding[]
  /** 剧本人气系统，由本地服务按时间表广播弹幕 */
  script: ScriptConfig
}

export const DEFAULT_CONFIG: StreamConfig = {
  canvas: { width: 1920, height: 1080 },
  hotkeys: [],
  script: {
    enabled: false,
    danmakus: [
      { id: 'dm-1', text: '主播今天讲什么', color: '#ffffff', delay: 3000, interval: 0 },
      { id: 'dm-2', text: '关注了关注了', color: '#ffd54f', delay: 8000, interval: 0 },
      { id: 'dm-3', text: '上次没赶上，这次终于赶上了', color: '#ffffff', delay: 15000, interval: 0 },
    ],
  },
  layers: [
    {
      id: 'welcome-text',
      type: 'text',
      name: '频道标题',
      transform: { x: 80, y: 60, width: 800, height: 80, opacity: 100, rotation: 0 },
      text: '欢迎来到直播间',
      fontSize: 48,
      color: '#ffffff',
      scroll: false,
    },
    {
      id: 'ticker-bottom',
      type: 'ticker',
      name: '底部滚动条',
      transform: { x: 0, y: 1000, width: 1920, height: 60, opacity: 100, rotation: 0 },
      text: '点击关注，不错过每一场直播 · 每晚 8 点准时开播',
      color: '#ffffff',
      bgColor: 'rgba(0,0,0,0.5)',
      speed: 60,
    },
  ],
}
