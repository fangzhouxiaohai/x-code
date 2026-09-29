import { useEffect, useRef, useState } from 'react';
import type { Conversation, Lang } from '../types';
import { t as translate } from '../lib/i18n';
import {
  IconArchive,
  IconDots,
  IconGpts,
  IconLibrary,
  IconNewChat,
  IconSettings,
  IconSora,
  IconSearch,
  IconShare,
  IconTrash,
  IconPencil,
  XCodeLogo,
} from './icons';

interface Props {
  open: boolean;
  conversations: Conversation[];
  activeId: string | null;
  lang: Lang;
  isMac: boolean;
  onNewChat: () => void;
  onOpenSearch: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
  onToggle: () => void;
}

function groupLabel(ts: number, lang: Lang): string {
  const now = new Date();
  const d = new Date(ts);
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.floor((startOfDay(now) - startOfDay(d)) / 86400000);
  if (days <= 0) return translate(lang, 'today');
  if (days === 1) return translate(lang, 'yesterday');
  if (days <= 7) return translate(lang, 'prev7Days');
  if (days <= 30) return translate(lang, 'prev30Days');
  return translate(lang, 'older');
}

function ChatItem({
  conv,
  active,
  lang,
  onSelect,
  onRename,
  onDelete,
}: {
  conv: Conversation;
  active: boolean;
  lang: Lang;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conv.title);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!rowRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const commit = () => {
    setEditing(false);
    onRename(draft);
  };

  const btn =
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/10 text-[#5d5d5d] dark:text-[#b4b4b4]';

  return (
    <div ref={rowRef} className="relative">
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(conv.title);
              setEditing(false);
            }
          }}
          className="w-full rounded-lg border border-[#0d0d0d]/20 bg-transparent px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/25 dark:focus:ring-white/20"
        />
      ) : (
        <div
          onClick={onSelect}
          className={`group flex h-9 cursor-pointer items-center rounded-lg px-2 text-sm ${
            active
              ? 'bg-[#ececec] dark:bg-[#2f2f2f]'
              : 'hover:bg-[#ececec]/70 dark:hover:bg-[#2f2f2f]/60'
          }`}
        >
          <span className="flex-1 truncate">{conv.title}</span>
          <button
            className={`${btn} h-7 w-7 ${
              menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            title="…"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            <IconDots size={17} />
          </button>
        </div>
      )}

      {menuOpen && !editing && (
        <div
          className="no-drag absolute right-1 top-9 z-50 w-44 rounded-2xl border border-black/10 bg-white p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.16)] dark:border-white/10 dark:bg-[#353535]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-black/[0.06] dark:hover:bg-white/10"
            onClick={() => {
              setMenuOpen(false);
            }}
          >
            <IconShare size={17} /> {translate(lang, 'share')}
          </button>
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-black/[0.06] dark:hover:bg-white/10"
            onClick={() => {
              setMenuOpen(false);
              setDraft(conv.title);
              setEditing(true);
            }}
          >
            <IconPencil size={17} /> {translate(lang, 'rename')}
          </button>
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-black/[0.06] dark:hover:bg-white/10"
            onClick={() => {
              setMenuOpen(false);
            }}
          >
            <IconArchive size={17} /> {translate(lang, 'archive')}
          </button>
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[#e02e2a] hover:bg-[#e02e2a]/10 dark:text-[#ff6f6b]"
            onClick={() => {
              setMenuOpen(false);
              onDelete();
            }}
          >
            <IconTrash size={17} /> {translate(lang, 'delete')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Sidebar(props: Props) {
  const {
    open,
    conversations,
    activeId,
    lang,
    onNewChat,
    onOpenSearch,
    onSelect,
    onRename,
    onDelete,
    onOpenSettings,
    onToggle,
  } = props;

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  const groups: { label: string; items: Conversation[] }[] = [];
  for (const c of sorted) {
    const label = groupLabel(c.updatedAt, lang);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(c);
    else groups.push({ label, items: [c] });
  }

  const item =
    'flex h-9 w-full items-center gap-2.5 rounded-lg px-2 text-sm text-[#0d0d0d] dark:text-[#ececec] hover:bg-[#ececec] dark:hover:bg-[#2f2f2f] transition-colors';

  return (
    <aside
      className={`relative z-20 flex h-full shrink-0 flex-col overflow-hidden bg-[#f9f9f9] transition-[width] duration-200 ease-out dark:bg-[#181818] ${
        open ? 'w-[260px]' : 'w-0'
      }`}
    >
      <div className="flex w-[260px] grow flex-col">
        {/* drag strip — macOS traffic lights sit here via hiddenInset */}
        <div className="app-drag h-[47px] shrink-0" />

        <div className="px-2.5">
          <button className={item} onClick={onNewChat}>
            <IconNewChat size={18} className="shrink-0" />
            <span className="truncate font-medium">{translate(lang, 'newChat')}</span>
          </button>
          <button className={item} onClick={onOpenSearch}>
            <IconSearch size={18} className="shrink-0" />
            <span className="truncate">{translate(lang, 'searchChats')}</span>
          </button>
          <button className={item}>
            <IconLibrary size={18} className="shrink-0" />
            <span className="truncate">{translate(lang, 'library')}</span>
          </button>
        </div>

        <div className="mt-3.5 px-2.5">
          <div className="h-px bg-black/[0.07] dark:bg-white/[0.08]" />
        </div>

        <div className="mt-3.5 px-2.5">
          <button className={item}>
            <IconSora size={18} className="shrink-0" />
            <span className="truncate">{translate(lang, 'sora')}</span>
          </button>
          <button className={item}>
            <IconGpts size={18} className="shrink-0" />
            <span className="truncate">{translate(lang, 'gpts')}</span>
          </button>
        </div>

        <div className="mt-3.5 flex min-h-0 flex-1 flex-col px-2.5">
          <div className="px-2 pb-1 text-sm font-medium text-[#8f8f8f] dark:text-[#9b9b9b]">
            {translate(lang, 'chats')}
          </div>
          <div className="scroll-thin min-h-0 flex-1 space-y-0.5 overflow-y-auto pb-2">
            {sorted.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-[#8f8f8f] dark:text-[#9b9b9b]">—</div>
            )}
            {groups.map((g) => (
              <div key={g.label}>
                <div className="px-2 pb-1 pt-3 text-xs font-medium text-[#8f8f8f] dark:text-[#9b9b9b]">
                  {g.label}
                </div>
                <div className="space-y-0.5">
                  {g.items.map((c) => (
                    <ChatItem
                      key={c.id}
                      conv={c}
                      active={c.id === activeId}
                      lang={lang}
                      onSelect={() => onSelect(c.id)}
                      onRename={(title) => onRename(c.id, title)}
                      onDelete={() => onDelete(c.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-2.5 pb-2.5">
          <button className={item} onClick={onOpenSettings}>
            <IconSettings size={18} className="shrink-0" />
            <span className="truncate">{translate(lang, 'settings')}</span>
          </button>
          <button className={item} onClick={onOpenSettings}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0d0d0d] text-white dark:bg-[#ececec] dark:text-[#0d0d0d]">
              <XCodeLogo size={15} />
            </span>
            <span className="truncate">X-Code · {translate(lang, 'free')}</span>
          </button>
        </div>
      </div>

      {/* click strip at the very edge when open (web-like collapse affordance hidden) */}
      <button
        className="absolute -right-px top-1/2 hidden h-16 w-1 -translate-y-1/2"
        onClick={onToggle}
        tabIndex={-1}
        aria-hidden="true"
      />
    </aside>
  );
}
