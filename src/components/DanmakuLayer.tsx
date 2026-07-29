import { useEffect, useRef } from 'react'

export interface DanmakuItem {
  id: string
  text: string
  color: string
}

interface Props {
  /** 画布宽度，用于计算飘动距离与起始位置 */
  canvasWidth: number
}

// 弹幕轨道数：新弹幕轮询分配到空闲轨道
const TRACK_COUNT = 6
const TRACK_HEIGHT = 40
const TRACK_TOP = 60
// 飘动时长（秒），越大越慢
const FLY_DURATION = 12

// 弹幕层：收到 onDanmaku 推送的弹幕，从右往左飘过画布，飘出后移除。
// 用 Web Animations API（element.animate）直接驱动 DOM，避免 CSS 变量在
// React 内联 style 中设置不可靠的问题（曾因此导致弹幕停在画布外不可见）。
export function DanmakuLayer({ canvasWidth }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const uidRef = useRef(0)
  // 各轨道上一次弹幕的发出时间，用于避免同轨道重叠
  const trackBusyUntil = useRef<number[]>(new Array(TRACK_COUNT).fill(0))

  const addRef = useRef<(d: DanmakuItem) => void>(() => {})
  addRef.current = (d: DanmakuItem) => {
    const container = containerRef.current
    if (!container) return

    const now = Date.now()
    // 找一个最早空闲的轨道
    let track = 0
    let minTime = trackBusyUntil.current[0]
    for (let i = 1; i < TRACK_COUNT; i++) {
      if (trackBusyUntil.current[i] < minTime) {
        minTime = trackBusyUntil.current[i]
        track = i
      }
    }
    const textLen = d.text.length * 24
    const enterMs = ((textLen / canvasWidth) * FLY_DURATION * 1000) / 2
    trackBusyUntil.current[track] = now + Math.max(800, enterMs)

    // 创建弹幕 DOM，用 Web Animations API 飘动
    const el = document.createElement('div')
    el.textContent = d.text
    el.style.cssText = `position:absolute;left:${canvasWidth}px;top:${track * TRACK_HEIGHT}px;color:${d.color};font-size:28px;white-space:nowrap;text-shadow:0 0 4px rgba(0,0,0,0.8),1px 1px 2px rgba(0,0,0,0.8);`
    container.appendChild(el)

    // 飘动距离：向左移动 画布宽度 + 自身宽度 + 余量
    const distance = canvasWidth + textLen + 20
    const anim = el.animate(
      [{ transform: 'translateX(0)' }, { transform: `translateX(-${distance}px)` }],
      { duration: FLY_DURATION * 1000, easing: 'linear', fill: 'forwards' },
    )
    anim.onfinish = () => el.remove()
    uidRef.current++
  }

  // 通过自定义事件让 Overlay 触发 add
  useEffect(() => {
    const handler = (e: Event) => addRef.current((e as CustomEvent<DanmakuItem>).detail)
    window.addEventListener('sx-danmaku', handler as EventListener)
    return () => window.removeEventListener('sx-danmaku', handler as EventListener)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: 0,
        top: TRACK_TOP,
        width: canvasWidth,
        height: TRACK_COUNT * TRACK_HEIGHT,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    />
  )
}

// 供 Overlay 调用：派发一条弹幕到弹幕层
export function emitDanmaku(d: DanmakuItem) {
  window.dispatchEvent(new CustomEvent('sx-danmaku', { detail: d }))
}
