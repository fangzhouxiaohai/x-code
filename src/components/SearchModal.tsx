import { useEffect, useMemo, useRef, useState } from 'react';
import type { Conversation, Lang } from '../types';
import { t as translate } from '../lib/i18n';
import { IconEnter, IconSearch } from './icons';

interface Props {
  lang: Lang;
  conversations: Conversation[];
  onClose: () => void;
  onSelect: (id: string) => void;
}

export default function SearchModal({ lang, conversations, onClose, onSelect }: Props) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q.trim()) return sorted.slice(0, 12);
    const needle = q.trim().toLowerCase();
    return sorted
      .filter(
        (c) =>
          c.title.toLowerCase().includes(needle) ||
          c.messages.some((m) => m.content.toLowerCase().includes(needle))
      )
      .slice(0, 20);
  }, [conversations, q]);

  return (
    <div
      className="no-drag fixed inset-0 z-[100] flex items-start justify-center bg-black/40 pt-[12vh] backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        className="w-[640px] max-w-[92vw] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.3)] dark:border-white/10 dark:bg-[#2f2f2f]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-black/[0.07] px-4 dark:border-white/[0.09]">
          <IconSearch size={18} className="text-[#8f8f8f] dark:text-[#9b9b9b]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && results.length > 0) {
                onSelect(results[0].id);
                onClose();
              }
            }}
            placeholder={translate(lang, 'searchPlaceholder')}
            className="h-[52px] flex-1 bg-transparent text-[15px] text-[#0d0d0d] outline-none placeholder:text-[#8f8f8f] dark:text-[#ececec] dark:placeholder:text-[#9b9b9b]"
          />
        </div>

        <div className="scroll-thin max-h-[380px] overflow-y-auto p-1.5">
          <div className="px-2.5 py-1.5 text-xs font-medium text-[#8f8f8f] dark:text-[#9b9b9b]">
            {q.trim() ? translate(lang, 'chats') : translate(lang, 'recent')}
          </div>
          {results.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-[#8f8f8f] dark:text-[#9b9b9b]">
              {translate(lang, 'noResults')}
            </div>
          )}
          {results.map((c) => (
            <button
              key={c.id}
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm hover:bg-black/[0.06] dark:hover:bg-white/10"
              onClick={() => {
                onSelect(c.id);
                onClose();
              }}
            >
              <IconSearch size={16} className="shrink-0 text-[#8f8f8f] dark:text-[#9b9b9b]" />
              <span className="flex-1 truncate">{c.title}</span>
              <IconEnter size={15} className="shrink-0 text-[#b4b4b4] dark:text-[#8f8f8f]" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 border-t border-black/[0.07] px-4 py-2 text-xs text-[#8f8f8f] dark:border-white/[0.09] dark:text-[#9b9b9b]">
          <span className="rounded border border-black/15 px-1 py-0.5 text-[10px] dark:border-white/20">↵</span>
          {lang === 'zh' ? '打开' : 'Open'}
          <span className="ml-3 rounded border border-black/15 px-1 py-0.5 text-[10px] dark:border-white/20">esc</span>
          {translate(lang, 'close')}
        </div>
      </div>
    </div>
  );
}
