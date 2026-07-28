// streamx-ui 本地服务
// 职责：在「配置页」与「直播展示页」之间充当本地中间人，解决 OBS/直播姬浏览器源
// 是独立进程、不共享内存导致配置无法实时同步的问题。
//
// 提供两条通道：
//  1. WebSocket（ws://127.0.0.1:3001）：配置页 POST 改动 -> 广播给所有展示页订阅者，秒级生效
//  2. HTTP 拉取兜底（GET /config）：当直播软件的浏览器源不支持/被断 WebSocket 时，
//     展示页可降级为定时轮询拉取最新配置，保证至少能拿到内容
//
// 本服务只在本地监听 127.0.0.1，不对外暴露。
import { createServer } from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'

const PORT = 3001
const HOST = '127.0.0.1'

// 当前配置（内存态）。首次启动为空对象，等待配置页写入。
// 进程重启会丢失，配置页会在连接时把当前配置 POST 上来同步。
let currentConfig = {}

const server = createServer((req, res) => {
  // 统一 CORS：配置页与展示页都跑在 5173，需允许跨域到 3001
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'GET' && req.url === '/config') {
    // 兜底通道：返回最新配置
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(currentConfig))
    return
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ ok: true, clients: wss.clients.size }))
    return
  }

  if (req.method === 'POST' && req.url === '/config') {
    // 用 Buffer 收集 body，比字符串拼接更稳健：
    // 避免多字节字符被 chunk 切断导致的解析失败，也规避 keep-alive 复用连接下的边界问题
    const chunks = []
    req.on('data', (chunk) => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8')
      try {
        currentConfig = JSON.parse(body)
        broadcast({ type: 'config:update', payload: currentConfig })
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: true }))
      } catch (err) {
        // 打印解析失败详情，便于排查 body 读取/编码问题
        console.error('[config] JSON 解析失败:', err.message, '| body 长度:', body.length, '| 前80字符:', JSON.stringify(body.slice(0, 80)))
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: 'invalid json' }))
      }
    })
    // 客户端异常断开（如浏览器关闭标签）时避免抛错
    req.on('error', (err) => {
      console.error('[config] 请求读取错误:', err.message)
    })
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify({ ok: false, error: 'not found' }))
})

const wss = new WebSocketServer({ server, path: '/ws' })

wss.on('connection', (ws) => {
  // 新展示页连接时，立即把当前配置推一份过去，避免空白等待下次更新
  ws.send(JSON.stringify({ type: 'config:full', payload: currentConfig }))
  ws.on('message', () => {
    // 展示页只读不写，收到消息忽略；预留扩展
  })
})

function broadcast(message) {
  const data = JSON.stringify(message)
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  }
}

server.listen(PORT, HOST, () => {
  console.log(`[streamx-ui] 本地服务已启动：`)
  console.log(`  WebSocket  ws://${HOST}:${PORT}/ws   （实时推送）`)
  console.log(`  HTTP       http://${HOST}:${PORT}/config （兜底拉取）`)
  console.log(`  健康检查   http://${HOST}:${PORT}/health`)
})
