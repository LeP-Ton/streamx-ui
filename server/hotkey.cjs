// 全局快捷键钩子模块
// 职责：用 uiohook-napi 监听全局按键，按当前 hotkeys 配置匹配组合键，
// 匹配命中时回调（由 index.js 广播给展示页）。
//
// 跨平台说明：
// - Windows：uiohook 全局钩子开箱即用，无需特殊权限
// - macOS：需辅助功能权限，且 Sonoma 对未签名二进制可能静默拦截，
//   钩子可能启动成功但收不到事件。本模块做了降级：钩子启动失败不致命，
//   HTTP/WS 通道照常工作，只是快捷键功能不可用。
// - Linux：需 X11 环境
//
// 任何阶段抛错都捕获并上报状态，绝不让钩子拖垮整个服务。

let uIOhook = null
let EventType = null
let enabled = false
let lastCombo = '' // 上一帧的组合键，用于去重（按下持续触发只算一次）

// 当前修饰键状态
const modifiers = {
  ctrl: false,
  alt: false,
  shift: false,
  meta: false,
}

let currentBindings = []
let onTrigger = () => {}
let onStatus = () => {}

/** 尝试加载 uiohook-napi，失败返回 false（降级） */
function loadUiohook() {
  try {
    const mod = require('uiohook-napi')
    uIOhook = mod.uIOhook
    EventType = mod.EventType
    return true
  } catch (err) {
    console.error('[hotkey] uiohook-napi 加载失败，快捷键功能不可用：', err.message)
    return false
  }
}

/** 把按键事件转成组合键字符串，如 "Ctrl+Shift+1" */
function buildCombo(e) {
  // uiohook 的 key 字段对字母是 "A"/"B"（大写带 shift 影响），这里归一化
  const parts = []
  if (modifiers.ctrl) parts.push('Ctrl')
  if (modifiers.alt) parts.push('Alt')
  if (modifiers.shift) parts.push('Shift')
  if (modifiers.meta) parts.push('Meta')
  // 主键：取 keycode 对应字符，简化为用 e.key 并去掉空格
  const main = String(e.key || '').trim()
  if (main) parts.push(main)
  return parts.join('+')
}

/** 判断该按键事件是否是修饰键，并更新修饰键状态 */
function updateModifiers(e) {
  // uiohook 用 keycode 区分修饰键，跨平台 keycode 不一致，这里用 key 名匹配
  const k = String(e.key || '').toLowerCase()
  if (k === 'ctrl' || k === 'control') return (modifiers.ctrl = true)
  if (k === 'alt' || k === 'option') return (modifiers.alt = true)
  if (k === 'shift') return (modifiers.shift = true)
  if (k === 'meta' || k === 'cmd' || k === 'command' || k === 'win') return (modifiers.meta = true)
  return false
}

function clearModifier(e) {
  const k = String(e.key || '').toLowerCase()
  if (k === 'ctrl' || k === 'control') modifiers.ctrl = false
  if (k === 'alt' || k === 'option') modifiers.alt = false
  if (k === 'shift') modifiers.shift = false
  if (k === 'meta' || k === 'cmd' || k === 'command' || k === 'win') modifiers.meta = false
}

function handleKeyPress(e) {
  if (updateModifiers(e)) return // 修饰键自身按下，不作为主键
  const combo = buildCombo(e)
  if (!combo || combo === lastCombo) return
  lastCombo = combo
  // 匹配绑定
  const hit = currentBindings.find((b) => normalize(b.combo) === normalize(combo))
  if (hit) {
    onTrigger({ layerId: hit.layerId, action: hit.action || 'popup', combo })
  }
}

function handleKeyRelease(e) {
  clearModifier(e)
  // 任意修饰键松开即重置 lastCombo，允许下次重新组合触发
  const k = String(e.key || '').toLowerCase()
  if (['ctrl', 'control', 'alt', 'option', 'shift', 'meta', 'cmd', 'command', 'win'].includes(k)) {
    lastCombo = ''
  }
}

/** 归一化组合键字符串便于比较：去空格、统一顺序（修饰键在前、主键在后） */
function normalize(combo) {
  if (!combo) return ''
  const MOD_ORDER = ['Ctrl', 'Alt', 'Shift', 'Meta']
  const parts = combo.split('+').map((s) => s.trim()).filter(Boolean)
  const mods = parts.filter((p) => MOD_ORDER.includes(p))
  const mains = parts.filter((p) => !MOD_ORDER.includes(p))
  mods.sort((a, b) => MOD_ORDER.indexOf(a) - MOD_ORDER.indexOf(b))
  return [...mods, ...mains].join('+')
}

/** 启动钩子 */
function start() {
  if (!loadUiohook()) {
    onStatus('unavailable')
    return
  }
  try {
    uIOhook.on(EventType.EVENT_KEY_PRESSED, handleKeyPress)
    uIOhook.on(EventType.EVENT_KEY_RELEASED, handleKeyRelease)
    uIOhook.start()
    enabled = true
    onStatus('running')
    console.log('[hotkey] 全局快捷键钩子已启动')
  } catch (err) {
    console.error('[hotkey] 钩子启动失败：', err.message)
    onStatus('unavailable')
  }
}

function stop() {
  if (!enabled || !uIOhook) return
  try {
    uIOhook.stop()
    enabled = false
  } catch {
    /* 忽略 */
  }
}

/** 更新快捷键绑定（配置页推送配置时调用） */
function setBindings(hotkeys) {
  currentBindings = Array.isArray(hotkeys) ? hotkeys : []
}

module.exports = {
  start,
  stop,
  setBindings,
  setOnTrigger: (fn) => {
    onTrigger = fn
  },
  setOnStatus: (fn) => {
    onStatus = fn
  },
}
