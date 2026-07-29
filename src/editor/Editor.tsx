import { useCallback, useEffect, useRef, useState } from 'react'
import type { Layer, StreamConfig } from '@/store/types'
import { DEFAULT_CONFIG } from '@/store/types'
import { pushConfig } from '@/lib/client'
import { Preview } from './Preview'
import { LayerList } from './LayerList'
import { LayerEditor } from './LayerEditor'
import { HotkeyPanel } from './HotkeyPanel'
import { ScriptPanel } from './ScriptPanel'

// 配置面板：左侧图层列表 + 中间实时预览 + 右侧选中图层属性编辑
export function Editor() {
  const [config, setConfig] = useState<StreamConfig>(DEFAULT_CONFIG)
  const [selectedId, setSelectedId] = useState<string | null>(
    DEFAULT_CONFIG.layers[0]?.id ?? null,
  )
  const [pushed, setPushed] = useState<boolean | null>(null)
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 防抖推送：连续编辑时合并推送，避免每次按键都打一次本地服务
  const schedulePush = useCallback((cfg: StreamConfig) => {
    if (pushTimer.current) clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(async () => {
      const ok = await pushConfig(cfg)
      setPushed(ok)
    }, 250)
  }, [])

  const update = useCallback(
    (next: StreamConfig) => {
      setConfig(next)
      schedulePush(next)
    },
    [schedulePush],
  )

  // 启动时把默认配置推一份到本地服务，保证展示页打开就有内容
  useEffect(() => {
    pushConfig(config).then(setPushed)
    // 仅启动时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selected = config.layers.find((l) => l.id === selectedId) ?? null

  const updateLayer = (id: string, patch: Partial<Layer>) => {
    update({
      ...config,
      layers: config.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
    })
  }

  const addLayer = (layer: Layer) => {
    update({ ...config, layers: [...config.layers, layer] })
    setSelectedId(layer.id)
  }

  const removeLayer = (id: string) => {
    const next = { ...config, layers: config.layers.filter((l) => l.id !== id) }
    update(next)
    if (selectedId === id) setSelectedId(next.layers[0]?.id ?? null)
  }

  const updateHotkeys = (hotkeys: StreamConfig['hotkeys']) => {
    update({ ...config, hotkeys })
  }

  const updateScript = (script: StreamConfig['script']) => {
    update({ ...config, script })
  }

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: 18 }}>streamx-ui 配置面板</h1>
        <div style={{ fontSize: 13, color: pushed ? '#4caf50' : '#e53935' }}>
          {pushed === null
            ? '连接中…'
            : pushed
              ? '已实时推送到展示页'
              : '推送失败：请确认本地服务已启动（npm run dev:server）'}
        </div>
      </header>

      <div style={bodyStyle}>
        <div style={asideWrapStyle}>
          <ScriptPanel script={config.script} onChange={updateScript} />
          <HotkeyPanel
            layers={config.layers}
            hotkeys={config.hotkeys}
            onChange={updateHotkeys}
          />
          <LayerList
            layers={config.layers}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={addLayer}
            onRemove={removeLayer}
          />
        </div>
        <Preview config={config} selectedId={selectedId} onSelect={setSelectedId} />
        <LayerEditor layer={selected} onChange={(patch) => selected && updateLayer(selected.id, patch)} />
      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'system-ui, -apple-system, "PingFang SC", sans-serif',
  background: '#1e1e1e',
  color: '#eee',
}

const headerStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: '#252526',
  borderBottom: '1px solid #333',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const bodyStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  gap: 1,
  background: '#333',
  overflow: 'hidden',
}

// 左侧栏容器：快捷键面板 + 图层列表纵向排列
const asideWrapStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: 220,
  background: '#252526',
  overflow: 'hidden',
}
