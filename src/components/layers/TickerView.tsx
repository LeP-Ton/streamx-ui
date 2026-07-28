import type { TickerLayer } from '@/store/types'
import { transformToStyle } from '../LayerView'

// 跑马灯图层：底部滚动文字条，按 speed（像素/秒）决定滚动速度
export function TickerView({ layer }: { layer: TickerLayer }) {
  // speed 越大越快，换算成 animation-duration（秒）：文字宽度近似按字符数估算
  // 跑马灯字号固定 24，如需可配后续在 TickerLayer 加 fontSize 字段
  const FONT_SIZE = 24
  const textWidth = layer.text.length * FONT_SIZE
  const duration = Math.max(4, textWidth / layer.speed)

  return (
    <div
      style={{
        ...transformToStyle(layer.transform),
        background: layer.bgColor,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          color: layer.color,
          fontSize: FONT_SIZE,
          paddingLeft: '100%',
          animation: `sx-scroll-left ${duration}s linear infinite`,
        }}
      >
        {layer.text}
      </div>
    </div>
  )
}
