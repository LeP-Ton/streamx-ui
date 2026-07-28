// 最小验证：全局键盘钩子能否在当前系统抓到按键
// 持续运行，按到键就打印；Ctrl+C 退出。
import { uIOhook, EventType } from 'uiohook-napi'

let count = 0

uIOhook.on(EventType.EVENT_KEY_PRESSED, (e) => {
  count++
  // 高亮一行，便于和终端自身的输入区分
  console.log(`\n>>> [按键捕获] key=${e.key} keycode=${e.keycode} (第 ${count} 次)`)
})

// 监听所有事件类型，排查是不是 key 事件根本没派发
uIOhook.on(EventType.EVENT_HOOK_ENABLED, () => console.log('[事件] 钩子已启用'))
uIOhook.on(EventType.EVENT_HOOK_DISABLED, () => console.log('[事件] 钩子已禁用'))

// 兜底：任何未处理的 error 都打出来，避免被静默吞掉
process.on('uncaughtException', (e) => console.log('[未捕获异常]', e))
process.on('unhandledRejection', (e) => console.log('[未处理拒绝]', e))

uIOhook.start()

console.log('钩子已启动，现在随便按键（不必在终端里输入文字）。')
console.log('看到 ">>> [按键捕获]" 行说明钩子可用。按 Ctrl+C 退出。')
console.log('若始终没有捕获行出现，说明 macOS 辅助功能权限未生效。')
console.log('macOS 检测：', process.platform, process.arch)

process.on('SIGINT', () => {
  console.log(`\n=== 退出，共捕获 ${count} 个按键 ===`)
  if (count > 0) {
    console.log('✅ 全局键盘钩子可用，方案可行')
  } else {
    console.log('❌ 未捕获到任何按键，需检查辅助功能权限')
  }
  uIOhook.stop()
  process.exit(0)
})
