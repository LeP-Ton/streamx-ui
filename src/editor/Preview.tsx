import { useEffect, useRef, useState } from 'react'
import type { StreamConfig } from '@/store/types'
import { LayerView } from '@/components/LayerView'

// 实时预览：按画布比例缩放到可用区域，所见即所得。
// 同时提供点击选中图层（命中测试用图层框，简化为点击即选中）。
interface Props {
  config: StreamConfig
  selectedId: string | null
  onSelect: (id: string) => void
}

export function Preview({ config, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)

  // 根据容器尺寸计算等比缩放
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const { clientWidth, clientHeight } = el
      const sx = (clientWidth - 32) / config.canvas.width
      const sy = (clientHeight - 32) / config.canvas.height
      setScale(Math.min(sx, sy))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [config.canvas.width, config.canvas.height])

  return (
    <main
      ref={containerRef}
      style={{
        flex: 1,
        background: '#1e1e1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* 棋盘格背景，暗示透明区，对应直播软件里的透明背景 */}
      <div
        style={{
          width: config.canvas.width * scale,
          height: config.canvas.height * scale,
          position: 'relative',
          backgroundImage:
            'linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: config.canvas.width,
            height: config.canvas.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'relative',
          }}
        >
          {config.layers.map((layer) => (
            <div
              key={layer.id}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(layer.id)
              }}
              style={{
                outline: layer.id === selectedId ? '2px solid #00aaff' : 'none',
              }}
            >
              <LayerView layer={layer} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
