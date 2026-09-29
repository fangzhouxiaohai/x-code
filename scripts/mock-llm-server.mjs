// Local OpenAI-compatible mock server used to verify real SSE streaming
// end-to-end without any API key:  node scripts/mock-llm-server.mjs
import http from 'node:http';

const PORT = 9911;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const REPLY = `你好！我是通过 **本地自定义供应商** 返回的真实流式回复。🎉

这一段文字通过 \`text/event-stream\` 逐 token 推送，用于验证 X-Code 的自定义模型供应商功能：

1. OpenAI 兼容协议（/v1/chat/completions）
2. SSE 增量解析
3. 可随时「停止」

> 本地服务（Ollama / LM Studio / llama.cpp）配置方式完全相同。`;

const server = http.createServer((req, res) => {
  const cors = { ...CORS };
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    return res.end();
  }

  if (req.method === 'GET' && req.url === '/v1/models') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
    return res.end(
      JSON.stringify({ data: [{ id: 'test-mini' }, { id: 'test-pro' }, { id: 'local-llama-3' }] })
    );
  }

  if (req.method === 'POST' && req.url === '/v1/chat/completions') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...cors,
    });

    // split into CJK-friendly chunks like a real tokenizer would
    const chunks = REPLY.match(/[\s\S]{1,3}/g) ?? [];
    let i = 0;
    const timer = setInterval(() => {
      if (i >= chunks.length) {
        clearInterval(timer);
        res.write('data: [DONE]\n\n');
        return res.end();
      }
      const payload = {
        id: 'chatcmpl-test',
        object: 'chat.completion.chunk',
        choices: [{ index: 0, delta: { content: chunks[i++] }, finish_reason: null }],
      };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }, 24);
    return;
  }

  res.writeHead(404, cors);
  res.end('not found');
});

server.listen(PORT, () => console.log(`mock llm server on http://localhost:${PORT}/v1`));
