import type { ImageLayer } from '@/store/types'
import { transformToStyle } from '../LayerView'

export function ImageView({ layer }: { layer: ImageLayer }) {
  return (
    <div style={transformToStyle(layer.transform)}>
      {layer.src ? (
        <img
          src={layer.src}
          alt={layer.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: layer.circle ? '50%' : 0,
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#333',
            borderRadius: layer.circle ? '50%' : 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888',
            fontSize: 12,
          }}
        >
          未设置图片
        </div>
      )}
    </div>
  )
}
