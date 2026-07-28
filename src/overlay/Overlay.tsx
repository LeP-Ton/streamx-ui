import { useCallback, useEffect, useRef, useState } from 'react'
import type { StreamConfig } from '@/store/types'
import { DEFAULT_CONFIG } from '@/store/types'
import { subscribeConfig, type SubscribeStatus } from '@/lib/client'
import { LayerView } from '@/components/LayerView'

// 直播展示页：订阅本地服务配置并渲染图层。
// 透明背景，画布按 canvas 尺寸渲染，由直播软件浏览器源按比例缩放铺满。
// 同时订阅快捷键触发事件：show/hide/toggle 控制图层显隐，popup 触发弹窗。
export function Overlay() {
  const [config, setConfig] = useState<StreamConfig>(DEFAULT_CONFIG)
  const [status, setStatus] = useState<SubscribeStatus>('disconnected')
  // 图层显隐覆盖：被快捷键 hide/toggle 影响的图层记录在此，覆盖配置默认显隐
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  // popup 触发计数：key=图层id，value=触发序号；变化时驱动 PopupView 重新弹出
  const [popupTriggers, setPopupTriggers] = useState<Record<string, number>>({})

  // 用 ref 持有最新 hiddenIds，避免回调闭包陈旧
  const hiddenRef = useRef(hiddenIds)
  hiddenRef.current = hiddenIds

  const handleTrigger = useCallback((event: { layerId: string; action: string; combo: string }) => {
    const { layerId, action } = event
    if (action === 'popup') {
      setPopupTriggers((prev) => ({ ...prev, [layerId]: (prev[layerId] ?? 0) + 1 }))
      return
    }
    // show/hide/toggle 调整图层显隐覆盖
    setHiddenIds((prev) => {
      const next = new Set(prev)
      if (action === 'hide') next.add(layerId)
      else if (action === 'show') next.delete(layerId)
      else if (action === 'toggle') {
        if (next.has(layerId)) next.delete(layerId)
        else next.add(layerId)
      }
      return next
    })
  }, [])

  useEffect(() => {
    const unsub = subscribeConfig({
      onConfig: setConfig,
      onStatus: setStatus,
      onTrigger: handleTrigger,
    })
    return unsub
  }, [handleTrigger])

  const { width, height } = config.canvas

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        transformOrigin: 'top left',
      }}
    >
      {config.layers.map((layer) => {
        const hidden = hiddenIds.has(layer.id)
        return (
          <LayerView
            key={layer.id}
            layer={layer}
            hidden={hidden}
            triggerCount={popupTriggers[layer.id] ?? 0}
          />
        )
      })}

      {/* 连接状态指示：仅当未稳定连接时显示，便于在直播软件里排查 */}
      {status !== 'ws' && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.6)',
            color: '#ffd54f',
            fontSize: 14,
            borderRadius: 4,
            fontFamily: 'monospace',
          }}
        >
          {status === 'polling' ? '轮询模式' : '未连接'}
        </div>
      )}
    </div>
  )
}
