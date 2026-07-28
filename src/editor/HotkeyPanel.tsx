import { useEffect, useState } from 'react'
import type { HotkeyBinding, Layer } from '@/store/types'

// 快捷键绑定列表，组合键在本组件内录制（监听浏览器 keydown），
// 录制结果即时同步到 config.hotkeys 并推送。
//
// 注意：这里录制的组合键由「本地服务的全局钩子」在直播中捕获，
// 与浏览器自身快捷键无关。录制仅用于生成 combo 字符串。
interface Props {
  layers: Layer[]
  hotkeys: HotkeyBinding[]
  onChange: (hotkeys: HotkeyBinding[]) => void
}

// 把浏览器 KeyboardEvent 转成与服务端一致的组合键字符串
function eventToCombo(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.ctrlKey) parts.push('Ctrl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')
  if (e.metaKey) parts.push('Meta')
  // 主键：忽略纯修饰键
  const main = e.key
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(main)) {
    // 字母归一化为大写，与服务端 buildCombo 对齐
    parts.push(main.length === 1 ? main.toUpperCase() : main)
  }
  return parts.join('+')
}

export function HotkeyPanel({ layers, hotkeys, onChange }: Props) {
  const [recordingId, setRecordingId] = useState<string | null>(null)

  // 录制中监听全局 keydown（配置页有焦点时即可，不需要系统钩子）
  useEffect(() => {
    if (!recordingId) return
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const combo = eventToCombo(e)
      if (!combo) return
      // 写入或更新该图层的绑定
      const existing = hotkeys.find((h) => h.layerId === recordingId)
      let next: HotkeyBinding[]
      if (existing) {
        next = hotkeys.map((h) => (h.layerId === recordingId ? { ...h, combo } : h))
      } else {
        next = [...hotkeys, { layerId: recordingId, combo, action: 'popup' }]
      }
      onChange(next)
      setRecordingId(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [recordingId, hotkeys, onChange])

  const removeBinding = (layerId: string) => {
    onChange(hotkeys.filter((h) => h.layerId !== layerId))
  }

  const setAction = (layerId: string, action: HotkeyBinding['action']) => {
    onChange(hotkeys.map((h) => (h.layerId === layerId ? { ...h, action } : h)))
  }

  return (
    <div style={{ padding: 12, borderBottom: '1px solid #333' }}>
      <div style={{ fontSize: 12, color: '#9cdcfe', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>
        快捷键绑定
      </div>
      <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 8 }}>
        录制后由本地服务全局钩子捕获，直播中按组合键即触发。Windows 开箱即用；macOS 需辅助功能权限。
      </div>

      {layers.length === 0 && <div style={{ fontSize: 13, opacity: 0.4 }}>暂无图层</div>}

      {layers.map((layer) => {
        const binding = hotkeys.find((h) => h.layerId === layer.id)
        const recording = recordingId === layer.id
        return (
          <div key={layer.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 12 }}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              [{layer.type}] {layer.name}
            </span>
            <select
              style={{ ...selectStyle, width: 70 }}
              value={binding?.action ?? 'popup'}
              onChange={(e) => setAction(layer.id, e.target.value as HotkeyBinding['action'])}
              disabled={!binding}
            >
              <option value="popup">弹窗</option>
              <option value="toggle">显隐</option>
              <option value="show">显示</option>
              <option value="hide">隐藏</option>
            </select>
            <button
              style={{ ...btnStyle, background: recording ? '#5a3d1a' : '#3a3d41', minWidth: 90 }}
              onClick={() => setRecordingId(recording ? null : layer.id)}
            >
              {recording ? '按下组合键…' : binding ? binding.combo : '未绑定'}
            </button>
            {binding && (
              <button style={delBtnStyle} onClick={() => removeBinding(layer.id)}>
                ×
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  padding: '3px 4px',
  background: '#3c3c3c',
  color: '#eee',
  border: '1px solid #555',
  borderRadius: 3,
  fontSize: 12,
}

const btnStyle: React.CSSProperties = {
  padding: '3px 8px',
  color: '#eee',
  border: '1px solid #555',
  borderRadius: 3,
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
