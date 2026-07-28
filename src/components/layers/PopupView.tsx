import { useEffect, useRef, useState } from 'react'
import type { PopupLayer } from '@/store/types'
import { transformToStyle } from '../LayerView'

interface Props {
  layer: PopupLayer
  /** 触发序号：每次快捷键触发 +1，驱动 manual 弹窗重新弹出 */
  triggerCount: number
}

// 弹窗图层：
// - manual 模式：默认隐藏，收到 triggerCount 变化时弹出，持续 duration 后消失
// - auto 模式：按 interval 自动循环弹出
export function PopupView({ layer, triggerCount }: Props) {
  const [visible, setVisible] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTrigger = useRef(0)

  // 通用：弹出并设定自动消失
  const pop = () => {
    setVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setVisible(false), layer.duration)
  }

  // manual 模式：监听 triggerCount 变化触发弹出
  useEffect(() => {
    if (layer.trigger !== 'manual') return
    if (triggerCount > lastTrigger.current) {
      lastTrigger.current = triggerCount
      pop()
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [triggerCount, layer.trigger, layer.duration])

  // auto 模式：按 interval 自动循环
  useEffect(() => {
    if (layer.trigger !== 'auto') return
    let interval: ReturnType<typeof setInterval>
    const cycle = () => {
      setVisible(true)
      if (hideTimer.current) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setVisible(false), layer.duration)
    }
    cycle()
    interval = setInterval(cycle, layer.interval)
    return () => {
      clearInterval(interval)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [layer.trigger, layer.duration, layer.interval])

  if (!visible) return null

  return (
    <div style={transformToStyle(layer.transform)}>
      <div
        style={{
          padding: '8px 16px',
          background: 'rgba(0,0,0,0.6)',
          color: layer.color,
          borderRadius: 8,
          fontSize: 24,
          animation: 'sx-pop-in 0.3s ease',
          display: 'inline-block',
        }}
      >
        {layer.text}
      </div>
    </div>
  )
}
