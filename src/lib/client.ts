// 本地服务客户端
// 封装配置页「写入」与展示页「订阅」两条逻辑，含 WebSocket 断线重连与降级轮询。
//
// 直播软件浏览器源对 WebSocket 的支持不确定（OBS 成熟，抖音直播助手未知），
// 因此展示页订阅时优先走 WebSocket，连不上或断线则自动降级为 HTTP 轮询，
// 保证至少能拿到配置内容（只是失去秒级实时性）。

import type { StreamConfig } from '@/store/types'

// 本地服务地址，开发期固定 127.0.0.1:3001
const HTTP_BASE = 'http://127.0.0.1:3001'
const WS_URL = 'ws://127.0.0.1:3001/ws'

/** 配置页：把最新配置推到本地服务（HTTP POST，服务再广播给展示页） */
export async function pushConfig(config: StreamConfig): Promise<boolean> {
  try {
    const res = await fetch(HTTP_BASE + '/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    return res.ok
  } catch {
    return false
  }
}

/** 一次性拉取最新配置（降级通道与初始化用） */
export async function fetchConfig(): Promise<StreamConfig | null> {
  try {
    const res = await fetch(HTTP_BASE + '/config')
    if (!res.ok) return null
    return (await res.json()) as StreamConfig
  } catch {
    return null
  }
}

export type SubscribeStatus = 'ws' | 'polling' | 'disconnected'

export interface SubscribeOptions {
  onConfig: (config: StreamConfig) => void
  onStatus?: (status: SubscribeStatus) => void
  /** 收到快捷键触发事件时回调（来自本地服务的全局键盘钩子） */
  onTrigger?: (event: TriggerEvent) => void
  /** 降级轮询间隔（毫秒），默认 2000 */
  pollInterval?: number
}

export interface TriggerEvent {
  layerId: string
  action: 'show' | 'hide' | 'toggle' | 'popup'
  combo: string
}

/**
 * 展示页：订阅配置更新。
 * 优先 WebSocket（实时），失败/断线自动降级为 HTTP 轮询。
 * 返回一个取消订阅函数。
 */
export function subscribeConfig(opts: SubscribeOptions): () => void {
  const { onConfig, onStatus, onTrigger, pollInterval = 2000 } = opts
  let stopped = false
  let ws: WebSocket | null = null
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let lastPollJson = ''
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  function startPolling() {
    if (pollTimer) return
    onStatus?.('polling')
    pollTimer = setInterval(async () => {
      if (stopped) return
      const cfg = await fetchConfig()
      if (!cfg) {
        onStatus?.('disconnected')
        return
      }
      const json = JSON.stringify(cfg)
      if (json !== lastPollJson) {
        lastPollJson = json
        onConfig(cfg)
      }
      onStatus?.('polling')
    }, pollInterval)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function startWs() {
    if (stopped) return
    try {
      ws = new WebSocket(WS_URL)
    } catch {
      startPolling()
      return
    }

    ws.onopen = () => {
      stopPolling()
      onStatus?.('ws')
    }

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'config:full' || msg.type === 'config:update') {
          if (msg.payload && Object.keys(msg.payload).length > 0) {
            onConfig(msg.payload as StreamConfig)
          }
        } else if (msg.type === 'trigger') {
          onTrigger?.({
            layerId: msg.layerId,
            action: msg.action,
            combo: msg.combo,
          })
        }
      } catch {
        /* 忽略非法消息 */
      }
    }

    // 断线：降级轮询，并尝试重连 WebSocket
    ws.onclose = () => {
      ws = null
      if (stopped) return
      startPolling()
      reconnectTimer = setTimeout(startWs, 3000)
    }

    ws.onerror = () => {
      // 触发 onclose，统一在 close 里处理降级
      ws?.close()
    }
  }

  // 启动时先拉一次配置打底，再尝试 WebSocket
  fetchConfig().then((cfg) => {
    if (cfg) onConfig(cfg)
    startWs()
  })

  return () => {
    stopped = true
    stopPolling()
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (ws) {
      ws.onclose = null
      ws.close()
    }
  }
}
