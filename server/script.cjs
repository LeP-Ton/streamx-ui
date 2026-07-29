// 剧本人气系统调度器
// 职责：按配置的剧本时间表，定时通过回调广播弹幕事件。
//
// 调度模型：
// - 每条弹幕有 delay（首条延迟）和 interval（循环间隔，0=只发一次）
// - 配置更新或总开关切换时，清空所有定时器并按新配置重建
// - 进程内调度，重启后从 delay 重新开始计时
//
// 内容中立：本模块只负责按时间表推送文本，不审查、不限制内容。
// 内容合规由配置页使用者自行把控。

let timers = []
let running = false
let onDanmaku = () => {}

function clearAll() {
  for (const t of timers) {
    clearTimeout(t)
    clearInterval(t)
  }
  timers = []
}

function schedule(script) {
  clearAll()
  if (!script || !script.enabled) {
    running = false
    return
  }
  running = true
  const list = Array.isArray(script.danmakus) ? script.danmakus : []
  for (const dm of list) {
    if (!dm || !dm.text) continue
    const delay = Math.max(0, Number(dm.delay) || 0)
    const interval = Number(dm.interval) || 0
    if (interval > 0) {
      // 循环：先 delay 后首次，之后按 interval 循环
      const t = setTimeout(() => {
        fire(dm)
        const i = setInterval(() => fire(dm), interval)
        timers.push(i)
      }, delay)
      timers.push(t)
    } else {
      // 单次
      const t = setTimeout(() => fire(dm), delay)
      timers.push(t)
    }
  }
}

function fire(dm) {
  onDanmaku({ text: dm.text, color: dm.color || '#ffffff', id: dm.id })
}

module.exports = {
  /** 配置更新时调用，传入 script 配置重建调度 */
  update(script) {
    schedule(script)
  },
  setOnDanmaku(fn) {
    onDanmaku = fn
  },
  stop() {
    clearAll()
    running = false
  },
  isRunning() {
    return running
  },
}
