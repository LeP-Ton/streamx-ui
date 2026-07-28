import type { Layer, LayerTransform } from '@/store/types'
import { TextView } from './layers/TextView'
import { ImageView } from './layers/ImageView'
import { PopupView } from './layers/PopupView'
import { EffectView } from './layers/EffectView'
import { TickerView } from './layers/TickerView'

// 把 transform 转成 CSS 样式，所有图层共用
export function transformToStyle(t: LayerTransform): React.CSSProperties {
  return {
    position: 'absolute',
    left: t.x,
    top: t.y,
    width: t.width,
    height: t.height,
    opacity: t.opacity / 100,
    transform: `rotate(${t.rotation}deg)`,
  }
}

interface LayerViewProps {
  layer: Layer
  /** 被快捷键 hide/toggle 隐藏时为 true，覆盖图层默认显隐 */
  hidden?: boolean
  /** popup 图层的触发序号，变化时驱动重新弹出 */
  triggerCount?: number
}

export function LayerView({ layer, hidden, triggerCount }: LayerViewProps) {
  if (hidden) return null

  switch (layer.type) {
    case 'text':
      return <TextView layer={layer} />
    case 'image':
      return <ImageView layer={layer} />
    case 'popup':
      return <PopupView layer={layer} triggerCount={triggerCount ?? 0} />
    case 'effect':
      return <EffectView layer={layer} />
    case 'ticker':
      return <TickerView layer={layer} />
    default:
      return null
  }
}
