import type { Layer, LayerType } from '@/store/types'

// 用一个自增 id 生成函数，避免引入额外依赖
let idSeq = 0
function genId(prefix: string) {
  idSeq += 1
  return `${prefix}-${Date.now().toString(36)}-${idSeq}`
}

const LAYER_TEMPLATES: Record<LayerType, () => Layer> = {
  text: () => ({
    id: genId('text'),
    type: 'text',
    name: '新文字',
    transform: { x: 100, y: 100, width: 400, height: 60, opacity: 100, rotation: 0 },
    text: '新文字',
    fontSize: 36,
    color: '#ffffff',
    scroll: false,
  }),
  image: () => ({
    id: genId('image'),
    type: 'image',
    name: '新图片',
    transform: { x: 100, y: 100, width: 200, height: 200, opacity: 100, rotation: 0 },
    src: '',
    circle: false,
  }),
  popup: () => ({
    id: genId('popup'),
    type: 'popup',
    name: '新弹窗',
    transform: { x: 100, y: 100, width: 300, height: 60, opacity: 100, rotation: 0 },
    text: '欢迎关注！',
    color: '#ffd54f',
    duration: 3000,
    trigger: 'manual',
    interval: 10000,
  }),
  effect: () => ({
    id: genId('effect'),
    type: 'effect',
    name: '新特效',
    transform: { x: 100, y: 100, width: 300, height: 300, opacity: 80, rotation: 0 },
    effect: 'particles',
    color: '#ff80ab',
  }),
  ticker: () => ({
    id: genId('ticker'),
    type: 'ticker',
    name: '新滚动条',
    transform: { x: 0, y: 1020, width: 1920, height: 60, opacity: 100, rotation: 0 },
    text: '滚动文字内容',
    color: '#ffffff',
    bgColor: 'rgba(0,0,0,0.5)',
    speed: 60,
  }),
}

interface Props {
  layers: Layer[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (layer: Layer) => void
  onRemove: (id: string) => void
}

export function LayerList({ layers, selectedId, onSelect, onAdd, onRemove }: Props) {
  return (
    <aside style={asideStyle}>
      <div style={{ padding: 8, borderBottom: '1px solid #333', fontWeight: 600 }}>图层</div>

      <div style={{ padding: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {(Object.keys(LAYER_TEMPLATES) as LayerType[]).map((type) => (
          <button key={type} style={addBtnStyle} onClick={() => onAdd(LAYER_TEMPLATES[type]())}>
            + {type}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {layers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => onSelect(layer.id)}
            style={{
              ...itemStyle,
              background: layer.id === selectedId ? '#094771' : 'transparent',
            }}
          >
            <span style={{ flex: 1 }}>
              <span style={{ opacity: 0.5, marginRight: 8 }}>[{layer.type}]</span>
              {layer.name}
            </span>
            <button
              style={delBtnStyle}
              onClick={(e) => {
                e.stopPropagation()
                onRemove(layer.id)
              }}
            >
              ×
            </button>
          </div>
        ))}
        {layers.length === 0 && (
          <div style={{ padding: 16, opacity: 0.4, fontSize: 13 }}>暂无图层，点击上方按钮添加</div>
        )}
      </div>
    </aside>
  )
}

const asideStyle: React.CSSProperties = {
  width: 220,
  background: '#252526',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const addBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 12,
  background: '#3a3d41',
  color: '#eee',
  border: '1px solid #555',
  borderRadius: 4,
  cursor: 'pointer',
}

const itemStyle: React.CSSProperties = {
  padding: '8px 12px',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  fontSize: 13,
  borderBottom: '1px solid #2d2d2d',
}

const delBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#999',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
}
