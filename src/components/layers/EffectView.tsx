import type { EffectLayer } from '@/store/types'
import { transformToStyle } from '../LayerView'

// 特效图层：初版用 CSS 粒子动画占位，后续按 effect 字段扩展不同特效
export function EffectView({ layer }: { layer: EffectLayer }) {
  return (
    <div style={transformToStyle(layer.transform)}>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: layer.color,
              opacity: 0.7,
              animation: `sx-float ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
