import { useEffect, useState } from 'react'
import type { StreamConfig } from '@/store/types'
import { DEFAULT_CONFIG } from '@/store/types'
import { subscribeConfig, type SubscribeStatus } from '@/lib/client'
import { LayerView } from '@/components/LayerView'

// 直播展示页：订阅本地服务配置并渲染图层。
// 透明背景，画布按 canvas 尺寸渲染，由直播软件浏览器源按比例缩放铺满。
export function Overlay() {
  const [config, setConfig] = useState<StreamConfig>(DEFAULT_CONFIG)
  const [status, setStatus] = useState<SubscribeStatus>('disconnected')

  useEffect(() => {
    const unsub = subscribeConfig({
      onConfig: setConfig,
      onStatus: setStatus,
    })
    return unsub
  }, [])

  const { width, height } = config.canvas

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        // 画布等比缩放铺满视口，保证直播软件按比例取景
        transformOrigin: 'top left',
      }}
    >
      {config.layers.map((layer) => (
        <LayerView key={layer.id} layer={layer} />
      ))}

      {/* 连接状态指示：仅当未稳定连接时显示，便于在直播软件里排查 */}
      {status !== 'ws' && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.6)',
            color: '#ffd54f',
            fontSize: 14,
            borderRadius: 4,
            fontFamily: 'monospace',
          }}
        >
          {status === 'polling' ? '轮询模式' : '未连接'}
        </div>
      )}
    </div>
  )
}
