import type { TextLayer } from '@/store/types'
import { transformToStyle } from '../LayerView'

// 文字图层：支持静态与跑马灯滚动
export function TextView({ layer }: { layer: TextLayer }) {
  return (
    <div style={transformToStyle(layer.transform)}>
      {layer.scroll ? (
        <div style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
          <div
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              color: layer.color,
              fontSize: layer.fontSize,
              animation: 'sx-scroll-left 8s linear infinite',
            }}
          >
            {layer.text}
          </div>
        </div>
      ) : (
        <div
          style={{
            color: layer.color,
            fontSize: layer.fontSize,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {layer.text}
        </div>
      )}
    </div>
  )
}
