import { useState } from 'react'
import type { ScriptConfig, ScriptDanmaku } from '@/store/types'

// 剧本人气系统配置面板：编辑弹幕条目、总开关。
// 内容中立：只提供编辑能力，文本由使用者自行填写。
interface Props {
  script: ScriptConfig
  onChange: (script: ScriptConfig) => void
}

let idSeq = 0
function genId() {
  idSeq += 1
  return `dm-${Date.now().toString(36)}-${idSeq}`
}

export function ScriptPanel({ script, onChange }: Props) {
  const [expanded, setExpanded] = useState(true)

  const setEnabled = (enabled: boolean) => onChange({ ...script, enabled })

  const addDanmaku = () => {
    const dm: ScriptDanmaku = {
      id: genId(),
      text: '新弹幕',
      color: '#ffffff',
      delay: script.danmakus.length * 5000 + 3000,
      interval: 0,
    }
    onChange({ ...script, danmakus: [...script.danmakus, dm] })
  }

  const updateDm = (id: string, patch: Partial<ScriptDanmaku>) => {
    onChange({
      ...script,
      danmakus: script.danmakus.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    })
  }

  const removeDm = (id: string) => {
    onChange({ ...script, danmakus: script.danmakus.filter((d) => d.id !== id) })
  }

  return (
    <div style={{ padding: 12, borderBottom: '1px solid #333' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ fontSize: 12, color: '#9cdcfe', fontWeight: 600, textTransform: 'uppercase' }}>
          剧本人气系统
        </span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>{expanded ? '▾' : '▸'}</span>
      </div>

      {expanded && (
        <>
          <div style={{ fontSize: 11, opacity: 0.5, margin: '6px 0' }}>
            按时间表自动推送弹幕营造氛围。内容请自行把控合规。
          </div>

          <label style={checkStyle}>
            <input type="checkbox" checked={script.enabled} onChange={(e) => setEnabled(e.target.checked)} />
            启用剧本
          </label>

          <div style={{ marginTop: 6 }}>
            {script.danmakus.map((dm, i) => (
              <div key={dm.id} style={dmBoxStyle}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ opacity: 0.5, fontSize: 11, minWidth: 24 }}>#{i + 1}</span>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={dm.text}
                    placeholder="弹幕内容"
                    onChange={(e) => updateDm(dm.id, { text: e.target.value })}
                  />
                  <input
                    type="color"
                    style={{ width: 28, height: 24, padding: 0, border: 'none', background: 'transparent' }}
                    value={normalizeColor(dm.color)}
                    onChange={(e) => updateDm(dm.id, { color: e.target.value })}
                  />
                  <button style={delBtnStyle} onClick={() => removeDm(dm.id)}>
                    ×
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <label style={miniLabelStyle}>
                    延迟ms
                    <input
                      type="number"
                      style={inputStyle}
                      value={dm.delay}
                      onChange={(e) => updateDm(dm.id, { delay: Number(e.target.value) })}
                    />
                  </label>
                  <label style={miniLabelStyle}>
                    间隔ms(0=单次)
                    <input
                      type="number"
                      style={inputStyle}
                      value={dm.interval}
                      onChange={(e) => updateDm(dm.id, { interval: Number(e.target.value) })}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button style={addBtnStyle} onClick={addDanmaku}>
            + 添加弹幕
          </button>
        </>
      )}
    </div>
  )
}

// 颜色选择器只接受 #rrggbb，把 rgba 等归一化成近似 hex
function normalizeColor(c: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c
  if (/^#[0-9a-fA-F]{3}$/.test(c)) return c
  return '#ffffff'
}

const inputStyle: React.CSSProperties = {
  padding: '3px 6px',
  background: '#3c3c3c',
  color: '#eee',
  border: '1px solid #555',
  borderRadius: 3,
  fontSize: 12,
  boxSizing: 'border-box',
  width: '100%',
}

const checkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  margin: '6px 0',
  cursor: 'pointer',
}

const dmBoxStyle: React.CSSProperties = {
  background: '#2d2d2d',
  padding: 6,
  borderRadius: 4,
  marginBottom: 6,
}

const miniLabelStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  fontSize: 10,
  opacity: 0.7,
  gap: 2,
}

const addBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px',
  background: '#3a3d41',
  color: '#eee',
  border: '1px solid #555',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
}

const delBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#999',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
}
