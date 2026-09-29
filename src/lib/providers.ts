import type { Provider } from '../types';

/**
 * Built-in provider presets. All "openai" kind presets speak the standard
 * OpenAI chat-completions protocol, which covers OpenAI, DeepSeek, GLM, Kimi,
 * Qwen, OpenRouter, Groq, Google Gemini (OpenAI-compat mode) and local servers
 * like Ollama / LM Studio / llama.cpp.
 */
export const PROVIDER_PRESETS: Omit<Provider, 'enabled'>[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    kind: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'o4-mini'],
    builtin: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    kind: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    apiKey: '',
    models: ['claude-sonnet-4-5', 'claude-haiku-4-5'],
    builtin: true,
  },
  {
    id: 'google',
    name: 'Google Gemini',
    kind: 'openai',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKey: '',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash'],
    builtin: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    kind: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: '',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    builtin: true,
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    kind: 'openai',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: '',
    models: ['glm-4.6', 'glm-4.5-air'],
    builtin: true,
  },
  {
    id: 'moonshot',
    name: 'Moonshot Kimi',
    kind: 'openai',
    baseUrl: 'https://api.moonshot.cn/v1',
    apiKey: '',
    models: ['kimi-k2-0905-preview', 'moonshot-v1-8k'],
    builtin: true,
  },
  {
    id: 'qwen',
    name: '阿里通义 Qwen',
    kind: 'openai',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: '',
    models: ['qwen-max', 'qwen-plus', 'qwen3-235b-a22b'],
    builtin: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    kind: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: '',
    models: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'deepseek/deepseek-chat'],
    builtin: true,
  },
  {
    id: 'groq',
    name: 'Groq',
    kind: 'openai',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: '',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    builtin: true,
  },
  {
    id: 'ollama',
    name: 'Ollama（本地）',
    kind: 'openai',
    baseUrl: 'http://localhost:11434/v1',
    apiKey: '',
    models: ['llama3.2', 'qwen2.5'],
    builtin: true,
  },
  {
    id: 'lmstudio',
    name: 'LM Studio（本地）',
    kind: 'openai',
    baseUrl: 'http://localhost:1234/v1',
    apiKey: '',
    models: ['local-model'],
    builtin: true,
  },
  {
    id: 'llamacpp',
    name: 'llama.cpp（本地）',
    kind: 'openai',
    baseUrl: 'http://localhost:8080/v1',
    apiKey: '',
    models: ['local-model'],
    builtin: true,
  },
];

export function defaultProviders(): Provider[] {
  return PROVIDER_PRESETS.map((p) => ({ ...p, enabled: false, models: [...p.models] }));
}

export function isLocalProvider(p: Provider): boolean {
  return /localhost|127\.0\.0\.1|\[::1\]/.test(p.baseUrl);
}
