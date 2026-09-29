import { useEffect, useRef } from 'react';
import type { Conversation, Lang } from '../types';
import { t as translate } from '../lib/i18n';
import type { AppStateApi } from '../lib/store';
import MessageRow from './Message';
import Composer from './Composer';

interface Props {
  lang: Lang;
  conversation: Conversation | null;
  streaming: boolean;
  demo: boolean;
  api: AppStateApi;
}

export default function ChatView({ lang, conversation, streaming, demo, api }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = conversation?.messages ?? [];
  const empty = messages.length === 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (nearBottom || streaming) bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, streaming]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {empty ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-16">
          <h1 className="mb-7 text-center text-[28px] font-normal tracking-[-0.01em] text-[#0d0d0d] dark:text-[#ececec]">
            {translate(lang, 'whatsOnYourMind')}
          </h1>
          <div className="w-full max-w-[768px]">
            <Composer
              lang={lang}
              streaming={streaming}
              autoFocusCenter
              onSend={api.send}
              onStop={api.stop}
            />
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="scroll-thin min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[768px] px-4 pb-8 pt-2">
              {messages.map((m) => (
                <MessageRow
                  key={m.id}
                  msg={m}
                  lang={lang}
                  onRegenerate={() => api.regenerate(m.id)}
                  onFeedback={(v) => api.setFeedback(m.id, v)}
                />
              ))}
              <div ref={bottomRef} className="h-2" />
            </div>
          </div>
          <div className="shrink-0 px-4 pb-3">
            <div className="mx-auto w-full max-w-[768px]">
              <Composer lang={lang} streaming={streaming} onSend={api.send} onStop={api.stop} />
              <p className="pt-2 text-center text-xs text-[#8f8f8f] dark:text-[#9b9b9b]">
                {demo
                  ? lang === 'zh'
                    ? '当前使用离线演示模型，回答由本地模拟生成。在「设置 → 模型供应商」中接入真实模型。'
                    : 'Using the offline demo model. Connect a real model in Settings → Model providers.'
                  : lang === 'zh'
                    ? 'X-Code 可能会出错，请核查重要信息。'
                    : 'X-Code can make mistakes. Check important info.'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
