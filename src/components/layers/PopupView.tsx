import { useEffect, useState } from 'react'
import type { PopupLayer } from '@/store/types'
import { transformToStyle } from '../LayerView'

// 弹窗图层：
// - manual 模式：由配置页触发显示（通过配置变更携带触发时间戳），这里监听触发
// - auto 模式：按 interval 自动弹出，持续 duration 后消失
// 初版仅实现 auto 模式与初始可见，manual 触发后续扩展
export function PopupView({ layer }: { layer: PopupLayer }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (layer.trigger !== 'auto') return
    let showTimer: ReturnType<typeof setTimeout>
    const cycle = () => {
      setVisible(true)
      showTimer = setTimeout(() => {
        setVisible(false)
      }, layer.duration)
    }
    cycle()
    const interval = setInterval(cycle, layer.interval)
    return () => {
      clearTimeout(showTimer)
      clearInterval(interval)
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
