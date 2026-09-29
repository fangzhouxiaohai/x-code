import { useEffect, useRef, useState } from 'react';
import type { Attachment, Lang } from '../types';
import { t as translate } from '../lib/i18n';
import {
  IconAttach,
  IconArrowUp,
  IconCheck,
  IconMic,
  IconPlus,
  IconStop,
  IconTools,
  IconWaveform,
  IconX,
} from './icons';

interface Props {
  lang: Lang;
  streaming: boolean;
  autoFocusCenter?: boolean;
  onSend: (text: string, attachments: Attachment[], tool: string | null) => void;
  onStop: () => void;
}

const TOOLS = [
  { id: 'image', zh: '创建图像', en: 'Create an image' },
  { id: 'web', zh: '联网搜索', en: 'Search the web' },
  { id: 'research', zh: '深度研究', en: 'Run deep research' },
  { id: 'think', zh: '思考更久', en: 'Think for longer' },
];

export default function Composer({ lang, streaming, autoFocusCenter, onSend, onStop }: Props) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [tool, setTool] = useState<string | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [text]);

  useEffect(() => {
    if (autoFocusCenter) taRef.current?.focus();
  }, [autoFocusCenter]);

  useEffect(() => {
    if (!toolsOpen) return;
    const close = (e: MouseEvent) => {
      if (!toolsRef.current?.contains(e.target as Node)) setToolsOpen(false);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [toolsOpen]);

  const submit = () => {
    if (streaming) return;
    onSend(text, attachments, tool);
    setText('');
    setAttachments([]);
    setTool(null);
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: Attachment[] = Array.from(files)
      .slice(0, 5)
      .map((f) => ({
        id: `${Date.now()}-${f.name}`,
        name: f.name,
        kind: /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name) ? 'image' : 'file',
      }));
    setAttachments((a) => [...a, ...next].slice(0, 8));
  };

  const hasText = text.trim().length > 0;
  const ghost =
    'no-drag flex h-9 w-9 items-center justify-center rounded-full text-[#0d0d0d]/80 hover:bg-black/[0.06] dark:text-[#ececec]/80 dark:hover:bg-white/10 transition-colors disabled:opacity-40';

  return (
    <div className="composer relative w-full rounded-[28px] border border-black/[0.08] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:border-white/[0.12] dark:bg-[#303030] dark:shadow-none">
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-3.5">
          {attachments.map((a) => (
            <span
              key={a.id}
              className="no-drag flex items-center gap-1.5 rounded-lg border border-black/10 bg-black/[0.04] py-1 pl-2.5 pr-1 text-xs dark:border-white/15 dark:bg-white/10"
            >
              {a.kind === 'image' ? '🖼️' : '📄'} <span className="max-w-[160px] truncate">{a.name}</span>
              <button
                className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/15"
                onClick={() => setAttachments((list) => list.filter((x) => x.id !== a.id))}
              >
                <IconX size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <textarea
        ref={taRef}
        rows={1}
        value={text}
        placeholder={translate(lang, 'askAnything')}
        className="block max-h-[200px] w-full resize-none bg-transparent px-[18px] pb-1 pt-[15px] text-[16px] leading-6 text-[#0d0d0d] outline-none placeholder:text-[#8f8f8f] dark:text-[#ececec] dark:placeholder:text-[#9b9b9b]"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
      />

      <div className="flex items-center gap-1 px-2.5 pb-2.5 pt-1">
        <button className={ghost} title={translate(lang, 'attachFile')} onClick={() => fileRef.current?.click()}>
          <IconPlus size={19} />
        </button>

        <div className="relative" ref={toolsRef}>
          {tool ? (
            <button
              className="no-drag flex h-9 items-center gap-1.5 rounded-full border border-[#0d0d0d]/15 bg-[#0d0d0d]/[0.04] px-3 text-sm text-[#0d0d0d] dark:border-white/20 dark:bg-white/10 dark:text-[#ececec]"
              onClick={() => setTool(null)}
            >
              {TOOLS.find((x) => x.id === tool)?.[lang]}
              <IconX size={13} />
            </button>
          ) : (
            <button
              className="no-drag flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm text-[#0d0d0d]/80 hover:bg-black/[0.06] dark:text-[#ececec]/80 dark:hover:bg-white/10"
              onClick={() => setToolsOpen((v) => !v)}
            >
              <IconTools size={18} />
              <span>{translate(lang, 'tools')}</span>
            </button>
          )}

          {toolsOpen && (
            <div className="no-drag absolute bottom-12 left-0 z-50 w-56 rounded-2xl border border-black/10 bg-white p-1.5 shadow-[0_16px_50px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-[#353535]">
              {TOOLS.map((x) => (
                <button
                  key={x.id}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-black/[0.06] dark:hover:bg-white/10"
                  onClick={() => {
                    setTool(x.id);
                    setToolsOpen(false);
                  }}
                >
                  {x[lang]}
                  {tool === x.id && <IconCheck size={15} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        <button className={ghost} title="麦克风">
          <IconMic size={19} />
        </button>

        {streaming ? (
          <button
            className="no-drag flex h-9 w-9 items-center justify-center rounded-full bg-[#0d0d0d] text-white hover:opacity-80 dark:bg-[#ececec] dark:text-[#0d0d0d]"
            title={translate(lang, 'stop')}
            onClick={onStop}
          >
            <IconStop size={18} />
          </button>
        ) : hasText || attachments.length > 0 ? (
          <button
            className="no-drag flex h-9 w-9 items-center justify-center rounded-full bg-[#0d0d0d] text-white hover:opacity-80 dark:bg-[#ececec] dark:text-[#0d0d0d]"
            title={translate(lang, 'voice')}
            onClick={submit}
          >
            <IconArrowUp size={19} />
          </button>
        ) : (
          <button
            className="no-drag flex h-9 w-9 items-center justify-center rounded-full bg-[#0d0d0d] text-white hover:opacity-80 dark:bg-[#ececec] dark:text-[#0d0d0d]"
            title={translate(lang, 'voice')}
          >
            <IconWaveform size={19} />
          </button>
        )}
      </div>
    </div>
  );
}
