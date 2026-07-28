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

export function LayerView({ layer }: { layer: Layer }) {
  switch (layer.type) {
    case 'text':
      return <TextView layer={layer} />
    case 'image':
      return <ImageView layer={layer} />
    case 'popup':
      return <PopupView layer={layer} />
    case 'effect':
      return <EffectView layer={layer} />
    case 'ticker':
      return <TickerView layer={layer} />
    default:
      return null
  }
}
