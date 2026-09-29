import type { Provider } from '../types';

export interface ChatMsg {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamOpts {
  provider: Provider;
  model: string;
  messages: ChatMsg[];
  signal: AbortSignal;
  onDelta: (text: string) => void;
}

async function errorMessage(res: Response): Promise<string> {
  let detail = '';
  try {
    const body = await res.text();
    try {
      const json = JSON.parse(body);
      detail = json?.error?.message ?? json?.message ?? body;
    } catch {
      detail = body;
    }
  } catch {
    /* ignore */
  }
  return `HTTP ${res.status}${detail ? ` — ${detail.slice(0, 300)}` : ''}`;
}

/** Stream an SSE response, invoking `onEvent` for every `data:` JSON payload. */
async function pumpSSE(res: Response, onEvent: (json: any) => void): Promise<void> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error('empty response body');
  const decoder = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop() ?? '';
    for (const part of parts) {
      for (const line of part.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        try {
          onEvent(JSON.parse(data));
        } catch {
          /* skip malformed keep-alives */
        }
      }
    }
  }
}

async function streamOpenAI(o: StreamOpts): Promise<void> {
  const res = await fetch(`${o.provider.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    signal: o.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(o.provider.apiKey ? { Authorization: `Bearer ${o.provider.apiKey}` } : {}),
    },
    body: JSON.stringify({ model: o.model, messages: o.messages, stream: true }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  await pumpSSE(res, (json) => {
    const delta = json?.choices?.[0]?.delta?.content;
    if (typeof delta === 'string' && delta) o.onDelta(delta);
  });
}

async function streamAnthropic(o: StreamOpts): Promise<void> {
  const res = await fetch(`${o.provider.baseUrl.replace(/\/+$/, '')}/v1/messages`, {
    method: 'POST',
    signal: o.signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': o.provider.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: o.model, max_tokens: 4096, messages: o.messages, stream: true }),
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  await pumpSSE(res, (json) => {
    if (json?.type === 'content_block_delta' && typeof json?.delta?.text === 'string') {
      o.onDelta(json.delta.text);
    }
  });
}

/** Stream a chat completion from any configured provider. */
export async function streamChat(o: StreamOpts): Promise<void> {
  if (o.provider.kind === 'anthropic') return streamAnthropic(o);
  return streamOpenAI(o);
}

/** List model ids from the provider (`GET /models`). */
export async function fetchProviderModels(provider: Provider): Promise<string[]> {
  const headers: Record<string, string> =
    provider.kind === 'anthropic'
      ? { 'x-api-key': provider.apiKey, 'anthropic-version': '2023-06-01' }
      : provider.apiKey
        ? { Authorization: `Bearer ${provider.apiKey}` }
        : {};
  const res = await fetch(`${provider.baseUrl.replace(/\/+$/, '')}/models`, { headers });
  if (!res.ok) throw new Error(await errorMessage(res));
  const json = await res.json();
  const arr: any[] = json?.data ?? json?.models ?? [];
  const ids = arr.map((m) => m?.id ?? m?.name).filter((x): x is string => typeof x === 'string');
  return [...new Set(ids)];
}

/** Quick connectivity test: stream a tiny completion and stop at the first token. */
export async function testProvider(provider: Provider, model: string): Promise<void> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 20000);
  try {
    let got = false;
    try {
      await streamChat({
        provider,
        model,
        messages: [{ role: 'user', content: 'Hi' }],
        signal: controller.signal,
        onDelta: () => {
          got = true;
          controller.abort();
        },
      });
    } catch (err) {
      if (!got) throw err; // abort after the first token means success
    }
    if (!got) throw new Error('no tokens received');
  } finally {
    window.clearTimeout(timer);
  }
}
