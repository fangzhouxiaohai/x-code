import { useEffect, useMemo, useRef, useState } from 'react';
import type { Lang, ModelSelection, Provider } from '../types';
import { t as translate } from '../lib/i18n';
import {
  IconCheck,
  IconChevronDown,
  IconMaximize,
  IconMinus,
  IconNewChat,
  IconRestore,
  IconSettings,
  IconShare,
  IconSidebar,
  IconX,
  XCodeLogo,
} from './icons';

interface Props {
  lang: Lang;
  providers: Provider[];
  activeModel: ModelSelection;
  sidebarOpen: boolean;
  isMac: boolean;
  isWindows: boolean;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onSetModel: (m: ModelSelection) => void;
  onManageProviders: () => void;
}

const DEMO_MODELS: { id: string; nameKey: 'modelAuto' | 'modelInstant' | 'modelThinking'; descKey: 'modelAutoDesc' | 'modelInstantDesc' | 'modelThinkingDesc' }[] = [
  { id: 'auto', nameKey: 'modelAuto', descKey: 'modelAutoDesc' },
  { id: 'instant', nameKey: 'modelInstant', descKey: 'modelInstantDesc' },
  { id: 'thinking', nameKey: 'modelThinking', descKey: 'modelThinkingDesc' },
];

function WindowControls() {
  const [maximized, setMaximized] = useState(false);
  useEffect(() => {
    const w = window.appWindow;
    if (!w) return;
    w.isMaximized?.().then(setMaximized);
    w.onMaximizedChange?.(setMaximized);
  }, []);

  const btn =
    'no-drag flex h-full w-[46px] items-center justify-center text-[#0d0d0d]/80 transition-colors hover:bg-black/[0.06] dark:text-[#ececec]/80 dark:hover:bg-white/10';

  return (
    <div className="flex h-full shrink-0 items-center">
      <button className={btn} onClick={() => window.appWindow?.minimize()} title="最小化">
        <IconMinus size={16} />
      </button>
      <button className={btn} onClick={() => window.appWindow?.toggleMaximize()} title={maximized ? '还原' : '最大化'}>
        {maximized ? <IconRestore size={15} /> : <IconMaximize size={14} />}
      </button>
      <button
        className={`${btn} hover:bg-[#e81123] hover:text-white dark:hover:bg-[#e81123] dark:hover:text-white`}
        onClick={() => window.appWindow?.close()}
        title="关闭"
      >
        <IconX size={16} />
      </button>
    </div>
  );
}

export default function TopBar({
  lang,
  providers,
  activeModel,
  sidebarOpen,
  isMac,
  isWindows,
  onToggleSidebar,
  onNewChat,
  onSetModel,
  onManageProviders,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const close = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setPickerOpen(false);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [pickerOpen]);

  const enabledProviders = useMemo(() => providers.filter((p) => p.enabled), [providers]);
  const isDemo = activeModel.providerId === 'demo';
  const activeProvider = enabledProviders.find((p) => p.id === activeModel.providerId);

  const brandLabel = isDemo
    ? '5.3'
    : (activeProvider?.name ?? activeModel.model.split('/').pop() ?? activeModel.model);

  const ghost =
    'no-drag flex h-9 w-9 items-center justify-center rounded-lg text-[#0d0d0d]/80 hover:bg-black/[0.06] dark:text-[#ececec]/80 dark:hover:bg-white/10 transition-colors';

  const pick = (providerId: string, model: string) => {
    onSetModel({ providerId, model });
    setPickerOpen(false);
  };

  const itemBase =
    'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-black/[0.06] dark:hover:bg-white/10';

  return (
    <header className="app-drag relative z-30 flex h-12 shrink-0 items-center gap-1 px-2.5">
      {/* left: sidebar toggle + new chat (only when the sidebar is closed) */}
      <div className="flex items-center gap-0.5">
        {!sidebarOpen && (
          <>
            <button className={ghost} onClick={onToggleSidebar} title={translate(lang, 'openSidebar')}>
              <IconSidebar size={19} />
            </button>
            <button className={ghost} onClick={onNewChat} title={translate(lang, 'newChatHint')}>
              <IconNewChat size={19} />
            </button>
          </>
        )}
      </div>

      {/* model picker */}
      <div className="relative" ref={pickerRef}>
        <button
          className="no-drag flex items-center gap-0.5 rounded-lg px-2.5 py-1.5 text-[16px] hover:bg-black/[0.06] dark:hover:bg-white/10 transition-colors"
          onClick={() => setPickerOpen((v) => !v)}
        >
          <span className="font-medium text-[#0d0d0d] dark:text-[#ececec]">X-Code</span>
          <span className="mt-0.5 max-w-[160px] truncate text-[10px] font-medium text-[#8f8f8f] dark:text-[#9b9b9b]">
            {brandLabel}
          </span>
          <IconChevronDown size={16} className="mt-0.5 text-[#8f8f8f] dark:text-[#9b9b9b]" />
        </button>

        {pickerOpen && (
          <div className="scroll-thin no-drag absolute left-0 top-11 z-50 max-h-[70vh] w-[320px] overflow-y-auto rounded-2xl border border-black/10 bg-white p-1.5 shadow-[0_16px_50px_rgba(0,0,0,0.18)] dark:border-white/10 dark:bg-[#353535]">
            {/* demo engine */}
            <div className="px-3 pb-1 pt-1.5 text-xs font-medium text-[#8f8f8f] dark:text-[#9b9b9b]">
              {translate(lang, 'demoModels')}
            </div>
            {DEMO_MODELS.map((m) => (
              <button
                key={m.id}
                className={itemBase}
                onClick={() => pick('demo', m.id)}
              >
                <span className="flex-1">
                  <span className="block text-sm font-medium">{translate(lang, m.nameKey)}</span>
                  <span className="mt-0.5 block text-xs text-[#8f8f8f] dark:text-[#9b9b9b]">
                    {translate(lang, m.descKey)}
                  </span>
                </span>
                {isDemo && activeModel.model === m.id && (
                  <IconCheck size={17} className="mt-1 shrink-0 text-[#0d0d0d] dark:text-[#ececec]" />
                )}
              </button>
            ))}

            {/* enabled providers, one section each */}
            {enabledProviders.map((p) => (
              <div key={p.id}>
                <div className="mx-3 my-1.5 h-px bg-black/[0.07] dark:bg-white/[0.09]" />
                <div className="flex items-center justify-between px-3 pb-1 pt-1 text-xs font-medium text-[#8f8f8f] dark:text-[#9b9b9b]">
                  <span className="truncate">{p.name}</span>
                </div>
                {p.models.length === 0 && (
                  <div className="px-3 py-1.5 text-xs text-[#8f8f8f] dark:text-[#9b9b9b]">
                    {translate(lang, 'noEnabledProviders')}
                  </div>
                )}
                {p.models.map((m) => (
                  <button key={m} className={itemBase} onClick={() => pick(p.id, m)}>
                    <span className="flex-1 truncate text-sm font-medium">{m}</span>
                    {!isDemo &&
                      activeModel.providerId === p.id &&
                      activeModel.model === m && (
                        <IconCheck size={17} className="mt-0.5 shrink-0 text-[#0d0d0d] dark:text-[#ececec]" />
                      )}
                  </button>
                ))}
              </div>
            ))}

            <div className="mx-3 my-1.5 h-px bg-black/[0.07] dark:bg-white/[0.09]" />
            <button
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-black/[0.06] dark:hover:bg-white/10"
              onClick={() => {
                setPickerOpen(false);
                onManageProviders();
              }}
            >
              <IconSettings size={16} />
              <span className="flex-1">{translate(lang, 'manageProviders')}</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* right: share + app avatar (+ window controls on Windows) */}
      <button className={ghost} title={translate(lang, 'share')}>
        <IconShare size={19} />
      </button>
      <button
        className="no-drag mr-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#0d0d0d] text-white hover:opacity-80 dark:bg-[#ececec] dark:text-[#0d0d0d]"
        title={translate(lang, 'settings')}
      >
        <XCodeLogo size={17} />
      </button>
      {isWindows && <WindowControls />}
    </header>
  );
}
