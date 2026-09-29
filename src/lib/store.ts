import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  AppState,
  Attachment,
  Conversation,
  Message,
  ModelSelection,
  Provider,
  ThemeSetting,
} from '../types';
import { chunkText, pickAnswer } from './mockAI';
import { defaultProviders } from './providers';
import { streamChat, type ChatMsg } from './llm';

const STORAGE_KEY = 'x-code:state:v2';

const uid = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Merge saved provider config over defaults so new presets appear after upgrades. */
function mergeProviders(saved: Provider[]): Provider[] {
  const defaults = defaultProviders();
  const byId = new Map(saved.map((p) => [p.id, p]));
  const merged = defaults.map((d) => {
    const s = byId.get(d.id);
    if (!s) return d;
    return { ...d, ...s, builtin: true, models: s.models?.length ? s.models : d.models };
  });
  const custom = saved.filter((p) => !p.builtin && !defaults.some((d) => d.id === p.id));
  return [...merged, ...custom];
}

function loadState(): AppState {
  const fallback: AppState = {
    conversations: [],
    activeId: null,
    activeModel: { providerId: 'demo', model: 'auto' },
    providers: defaultProviders(),
    theme: 'system',
    lang: 'zh',
    sidebarOpen: true,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as Partial<AppState> & { model?: string };
    return {
      ...fallback,
      ...saved,
      activeModel: saved.activeModel ?? { providerId: 'demo', model: saved.model ?? 'auto' },
      providers: mergeProviders(saved.providers ?? []),
      conversations: (saved.conversations ?? []).map((c) => ({
        ...c,
        messages: c.messages.map((m) => ({ ...m, streaming: false })),
      })),
    };
  } catch {
    return fallback;
  }
}

export interface AppStateApi {
  state: AppState;
  activeConversation: Conversation | null;
  isStreaming: boolean;
  newChat: () => void;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  clearAllChats: () => void;
  send: (text: string, attachments: Attachment[], tool: string | null) => void;
  stop: () => void;
  regenerate: (messageId: string) => void;
  setFeedback: (messageId: string, value: 'up' | 'down') => void;
  setModel: (selection: ModelSelection) => void;
  updateProvider: (id: string, patch: Partial<Provider>) => void;
  addProvider: (p: Provider) => void;
  removeProvider: (id: string) => void;
  setTheme: (t: ThemeSetting) => void;
  setLang: (l: AppState['lang']) => void;
  toggleSidebar: () => void;
}

export function useAppState(): AppStateApi {
  const [state, setState] = useState<AppState>(loadState);
  const [isStreaming, setIsStreaming] = useState(false);
  const timers = useRef<number[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const { conversations, ...rest } = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...rest, conversations }));
    } catch {
      /* storage full — ignore */
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark: boolean) => root.classList.toggle('dark', dark);
    if (state.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const onChange = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    apply(state.theme === 'dark');
  }, [state.theme]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearInterval(id));
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const activeConversation = useMemo(
    () => state.conversations.find((c) => c.id === state.activeId) ?? null,
    [state.conversations, state.activeId]
  );

  const newChat = useCallback(() => {
    clearTimers();
    abortRef.current?.abort();
    setIsStreaming(false);
    setState((s) => ({ ...s, activeId: null }));
  }, [clearTimers]);

  const selectChat = useCallback((id: string) => {
    setState((s) => ({ ...s, activeId: id }));
  }, []);

  const deleteChat = useCallback((id: string) => {
    setState((s) => {
      const conversations = s.conversations.filter((c) => c.id !== id);
      return { ...s, conversations, activeId: s.activeId === id ? null : s.activeId };
    });
  }, []);

  const renameChat = useCallback((id: string, title: string) => {
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, title: title.trim() || c.title } : c
      ),
    }));
  }, []);

  const clearAllChats = useCallback(() => {
    clearTimers();
    abortRef.current?.abort();
    setIsStreaming(false);
    setState((s) => ({ ...s, conversations: [], activeId: null }));
  }, [clearTimers]);

  /** Patch a single message inside one conversation. */
  const patchMessage = useCallback(
    (convId: string, msgId: string, fn: (m: Message) => Message) => {
      setState((s) => ({
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === convId
            ? {
                ...c,
                updatedAt: Date.now(),
                messages: c.messages.map((m) => (m.id === msgId ? fn(m) : m)),
              }
            : c
        ),
      }));
    },
    []
  );

  /** Finalize a message that is done streaming. */
  const finishMessage = useCallback(
    (convId: string, msgId: string) => {
      setIsStreaming(false);
      patchMessage(convId, msgId, (m) => ({ ...m, streaming: false }));
    },
    [patchMessage]
  );

  /** Offline demo engine (no provider configured). */
  const streamDemo = useCallback(
    (convId: string, assistantId: string, prompt: string) => {
      const model = stateRef.current.activeModel.model;
      const { text, thinking } = pickAnswer(prompt, model as any);
      const startBody = () => {
        const chunks = chunkText(text);
        let idx = 0;
        const timer = window.setInterval(() => {
          idx = Math.min(idx + 1 + Math.floor(Math.random() * 2), chunks.length);
          const partial = chunks.slice(0, idx).join('');
          patchMessage(convId, assistantId, (m) => ({ ...m, content: partial }));
          if (idx >= chunks.length) {
            window.clearInterval(timer);
            finishMessage(convId, assistantId);
          }
        }, 32);
        timers.current.push(timer);
      };
      if (thinking) {
        const t = window.setTimeout(() => {
          patchMessage(convId, assistantId, (m) => ({ ...m, thinking }));
          startBody();
        }, 1600);
        timers.current.push(t);
      } else {
        startBody();
      }
    },
    [patchMessage, finishMessage]
  );

  /** Real provider streaming (OpenAI-compatible or Anthropic). */
  const streamProvider = useCallback(
    async (convId: string, assistantId: string, history: ChatMsg[]) => {
      const { activeModel, providers } = stateRef.current;
      const provider = providers.find((p) => p.id === activeModel.providerId);
      if (!provider) {
        finishMessage(convId, assistantId);
        return;
      }
      const controller = new AbortController();
      abortRef.current = controller;
      let acc = '';
      try {
        await streamChat({
          provider,
          model: activeModel.model,
          messages: history,
          signal: controller.signal,
          onDelta: (delta) => {
            acc += delta;
            patchMessage(convId, assistantId, (m) => ({ ...m, content: acc }));
          },
        });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          const msg = `⚠️ 请求失败：${err?.message ?? String(err)}`;
          patchMessage(convId, assistantId, (m) => ({
            ...m,
            content: acc ? m.content : msg,
          }));
        }
      } finally {
        abortRef.current = null;
        finishMessage(convId, assistantId);
      }
    },
    [patchMessage, finishMessage]
  );

  const send = useCallback(
    (text: string, attachments: Attachment[], tool: string | null) => {
      const trimmed = text.trim();
      if (!trimmed && attachments.length === 0) return;
      clearTimers();
      abortRef.current?.abort();
      setIsStreaming(true);

      const now = Date.now();
      const userMsg: Message = {
        id: uid(),
        role: 'user',
        content: trimmed,
        attachments: attachments.length ? attachments : undefined,
        tool,
      };
      const assistantMsg: Message = { id: uid(), role: 'assistant', content: '', streaming: true };

      const s = stateRef.current;
      const existing = s.activeId ? s.conversations.find((c) => c.id === s.activeId) : null;

      let convId: string;
      let baseMessages: Message[];
      if (existing) {
        convId = existing.id;
        baseMessages = [...existing.messages, userMsg, assistantMsg];
        setState((cur) => ({
          ...cur,
          conversations: cur.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: baseMessages,
                  updatedAt: now,
                }
              : c
          ),
        }));
      } else {
        convId = uid();
        baseMessages = [userMsg, assistantMsg];
        const conv: Conversation = {
          id: convId,
          title: trimmed.length > 30 ? `${trimmed.slice(0, 30)}…` : trimmed || '新对话',
          messages: baseMessages,
          createdAt: now,
          updatedAt: now,
        };
        setState((cur) => ({
          ...cur,
          conversations: [conv, ...cur.conversations],
          activeId: convId,
        }));
      }

      if (s.activeModel.providerId === 'demo') {
        streamDemo(convId, assistantMsg.id, trimmed);
      } else {
        const history: ChatMsg[] = baseMessages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .filter((m) => m.id !== assistantMsg.id && m.content.trim().length > 0)
          .slice(-30)
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
        void streamProvider(convId, assistantMsg.id, history);
      }
    },
    [streamDemo, streamProvider, clearTimers]
  );

  const stop = useCallback(() => {
    clearTimers();
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.streaming ? { ...m, streaming: false, content: m.content || '（已停止生成）' } : m
        ),
      })),
    }));
  }, [clearTimers]);

  const regenerate = useCallback(
    (messageId: string) => {
      clearTimers();
      abortRef.current?.abort();
      const conv = stateRef.current.conversations.find((c) =>
        c.messages.some((m) => m.id === messageId)
      );
      if (!conv) return;
      const idx = conv.messages.findIndex((m) => m.id === messageId);
      const prevUser = [...conv.messages.slice(0, idx)].reverse().find((m) => m.role === 'user');
      const prompt = prevUser?.content ?? '';
      setIsStreaming(true);
      setState((s) => ({
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === conv.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId
                    ? { ...m, content: '', thinking: undefined, streaming: true, feedback: null }
                    : m
                ),
              }
            : c
        ),
      }));
      if (stateRef.current.activeModel.providerId === 'demo') {
        streamDemo(conv.id, messageId, prompt);
      } else {
        const history: ChatMsg[] = conv.messages
          .slice(0, idx)
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .filter((m) => m.content.trim().length > 0)
          .slice(-30)
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
        void streamProvider(conv.id, messageId, history);
      }
    },
    [streamDemo, streamProvider, clearTimers]
  );

  const setFeedback = useCallback((messageId: string, value: 'up' | 'down') => {
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === messageId ? { ...m, feedback: m.feedback === value ? null : value } : m
        ),
      })),
    }));
  }, []);

  const setModel = useCallback(
    (selection: ModelSelection) => setState((s) => ({ ...s, activeModel: selection })),
    []
  );
  const updateProvider = useCallback(
    (id: string, patch: Partial<Provider>) =>
      setState((s) => ({
        ...s,
        providers: s.providers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      })),
    []
  );
  const addProvider = useCallback(
    (p: Provider) => setState((s) => ({ ...s, providers: [...s.providers, p] })),
    []
  );
  const removeProvider = useCallback(
    (id: string) =>
      setState((s) => ({
        ...s,
        providers: s.providers.filter((p) => p.id !== id),
        activeModel:
          s.activeModel.providerId === id
            ? { providerId: 'demo', model: 'auto' }
            : s.activeModel,
      })),
    []
  );

  const setTheme = useCallback((t: ThemeSetting) => setState((s) => ({ ...s, theme: t })), []);
  const setLang = useCallback((l: AppState['lang']) => setState((s) => ({ ...s, lang: l })), []);
  const toggleSidebar = useCallback(
    () => setState((s) => ({ ...s, sidebarOpen: !s.sidebarOpen })),
    []
  );

  return {
    state,
    activeConversation,
    isStreaming,
    newChat,
    selectChat,
    deleteChat,
    renameChat,
    clearAllChats,
    send,
    stop,
    regenerate,
    setFeedback,
    setModel,
    updateProvider,
    addProvider,
    removeProvider,
    setTheme,
    setLang,
    toggleSidebar,
  };
}
