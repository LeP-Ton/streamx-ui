import type { Layer, LayerTransform } from '@/store/types'

// 选中图层的属性编辑器：根据图层类型渲染对应表单。
// 初版提供通用 transform 编辑 + 各类型特有字段，够用即可，后续按需细化。
interface Props {
  layer: Layer | null
  onChange: (patch: Partial<Layer>) => void
}

export function LayerEditor({ layer, onChange }: Props) {
  if (!layer) {
    return (
      <aside style={asideStyle}>
        <div style={{ padding: 8, borderBottom: '1px solid #333', fontWeight: 600 }}>属性</div>
        <div style={{ padding: 16, opacity: 0.4, fontSize: 13 }}>请从左侧选择一个图层</div>
      </aside>
    )
  }

  const setTransform = (patch: Partial<LayerTransform>) => {
    onChange({ transform: { ...layer.transform, ...patch } } as Partial<Layer>)
  }

  return (
    <aside style={asideStyle}>
      <div style={{ padding: 8, borderBottom: '1px solid #333', fontWeight: 600 }}>属性 · {layer.type}</div>
      <div style={{ padding: 12, overflow: 'auto', flex: 1 }}>
        <Field label="名称">
          <input
            style={inputStyle}
            value={layer.name}
            onChange={(e) => onChange({ name: e.target.value } as Partial<Layer>)}
          />
        </Field>

        <SectionTitle>位置与尺寸</SectionTitle>
        <div style={rowStyle}>
          <NumField label="X" value={layer.transform.x} onChange={(v) => setTransform({ x: v })} />
          <NumField label="Y" value={layer.transform.y} onChange={(v) => setTransform({ y: v })} />
        </div>
        <div style={rowStyle}>
          <NumField label="宽" value={layer.transform.width} onChange={(v) => setTransform({ width: v })} />
          <NumField label="高" value={layer.transform.height} onChange={(v) => setTransform({ height: v })} />
        </div>
        <div style={rowStyle}>
          <NumField
            label="透明度%"
            value={layer.transform.opacity}
            min={0}
            max={100}
            onChange={(v) => setTransform({ opacity: v })}
          />
          <NumField
            label="旋转°"
            value={layer.transform.rotation}
            min={0}
            max={360}
            onChange={(v) => setTransform({ rotation: v })}
          />
        </div>

        <LayerTypeFields layer={layer} onChange={onChange} />
      </div>
    </aside>
  )
}

// 按图层类型分发特有字段
function LayerTypeFields({
  layer,
  onChange,
}: {
  layer: Layer
  onChange: (patch: Partial<Layer>) => void
}) {
  switch (layer.type) {
    case 'text':
      return (
        <>
          <SectionTitle>文字</SectionTitle>
          <Field label="内容">
            <textarea
              style={{ ...inputStyle, height: 60, resize: 'vertical' }}
              value={layer.text}
              onChange={(e) => onChange({ text: e.target.value } as Partial<Layer>)}
            />
          </Field>
          <div style={rowStyle}>
            <NumField label="字号" value={layer.fontSize} onChange={(v) => onChange({ fontSize: v } as Partial<Layer>)} />
            <ColorField label="颜色" value={layer.color} onChange={(v) => onChange({ color: v } as Partial<Layer>)} />
          </div>
          <label style={checkStyle}>
            <input
              type="checkbox"
              checked={layer.scroll}
              onChange={(e) => onChange({ scroll: e.target.checked } as Partial<Layer>)}
            />
            跑马灯滚动
          </label>
        </>
      )
    case 'image':
      return (
        <>
          <SectionTitle>图片</SectionTitle>
          <Field label="图片地址">
            <input
              style={inputStyle}
              value={layer.src}
              placeholder="http:// 或本地路径"
              onChange={(e) => onChange({ src: e.target.value } as Partial<Layer>)}
            />
          </Field>
          <label style={checkStyle}>
            <input
              type="checkbox"
              checked={layer.circle}
              onChange={(e) => onChange({ circle: e.target.checked } as Partial<Layer>)}
            />
            圆形裁剪（头像）
          </label>
        </>
      )
    case 'popup':
      return (
        <>
          <SectionTitle>弹窗</SectionTitle>
          <Field label="内容">
            <input
              style={inputStyle}
              value={layer.text}
              onChange={(e) => onChange({ text: e.target.value } as Partial<Layer>)}
            />
          </Field>
          <ColorField label="颜色" value={layer.color} onChange={(v) => onChange({ color: v } as Partial<Layer>)} />
          <div style={rowStyle}>
            <NumField label="持续ms" value={layer.duration} onChange={(v) => onChange({ duration: v } as Partial<Layer>)} />
            <NumField label="间隔ms" value={layer.interval} onChange={(v) => onChange({ interval: v } as Partial<Layer>)} />
          </div>
          <Field label="触发">
            <select
              style={inputStyle}
              value={layer.trigger}
              onChange={(e) => onChange({ trigger: e.target.value as 'manual' | 'auto' } as Partial<Layer>)}
            >
              <option value="manual">手动触发</option>
              <option value="auto">自动循环</option>
            </select>
          </Field>
        </>
      )
    case 'effect':
      return (
        <>
          <SectionTitle>特效</SectionTitle>
          <Field label="样式">
            <select
              style={inputStyle}
              value={layer.effect}
              onChange={(e) => onChange({ effect: e.target.value } as Partial<Layer>)}
            >
              <option value="particles">粒子飘浮</option>
            </select>
          </Field>
          <ColorField label="颜色" value={layer.color} onChange={(v) => onChange({ color: v } as Partial<Layer>)} />
        </>
      )
    case 'ticker':
      return (
        <>
          <SectionTitle>滚动条</SectionTitle>
          <Field label="内容">
            <input
              style={inputStyle}
              value={layer.text}
              onChange={(e) => onChange({ text: e.target.value } as Partial<Layer>)}
            />
          </Field>
          <div style={rowStyle}>
            <ColorField label="文字色" value={layer.color} onChange={(v) => onChange({ color: v } as Partial<Layer>)} />
            <ColorField label="背景色" value={layer.bgColor} onChange={(v) => onChange({ bgColor: v } as Partial<Layer>)} />
          </div>
          <NumField label="速度px/s" value={layer.speed} onChange={(v) => onChange({ speed: v } as Partial<Layer>)} />
        </>
      )
    default:
      return null
  }
}

/* ---------- 通用表单小组件 ---------- */

const asideStyle: React.CSSProperties = {
  width: 280,
  background: '#252526',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 6px',
  background: '#3c3c3c',
  color: '#eee',
  border: '1px solid #555',
  borderRadius: 3,
  fontSize: 13,
  boxSizing: 'border-box',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
}

const checkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  margin: '8px 0',
  cursor: 'pointer',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 14,
        marginBottom: 6,
        fontSize: 12,
        color: '#9cdcfe',
        fontWeight: 600,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

function NumField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{label}</div>
      <input
        type="number"
        style={inputStyle}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{label}</div>
      <input
        type="text"
        style={inputStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
