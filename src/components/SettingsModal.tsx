import { useState } from 'react';
import type { AppState, Lang, Provider, ProviderKind } from '../types';
import { t as translate, type TKey } from '../lib/i18n';
import { PROVIDER_PRESETS, isLocalProvider } from '../lib/providers';
import { fetchProviderModels, testProvider } from '../lib/llm';
import { IconChevronDown, IconPlus, IconTrash, IconX } from './icons';

interface Props {
  lang: Lang;
  theme: AppState['theme'];
  providers: Provider[];
  onClose: () => void;
  onSetTheme: (t: AppState['theme']) => void;
  onSetLang: (l: Lang) => void;
  onClearAll: () => void;
  onUpdateProvider: (id: string, patch: Partial<Provider>) => void;
  onAddProvider: (p: Provider) => void;
  onRemoveProvider: (id: string) => void;
}

type Tab = 'providers' | 'general' | 'data';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function ProviderCard({
  provider,
  lang,
  onUpdate,
  onRemove,
}: {
  provider: Provider;
  lang: Lang;
  onUpdate: (patch: Partial<Provider>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [newModel, setNewModel] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<'test' | 'fetch' | null>(null);

  const btn =
    'rounded-lg border border-black/15 px-2.5 py-1.5 text-xs hover:bg-black/[0.05] disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10';

  const doTest = async () => {
    if (provider.models.length === 0) {
      setStatus({ ok: false, text: translate(lang, 'noEnabledProviders') });
      return;
    }
    setBusy('test');
    setStatus(null);
    try {
      await testProvider(provider, provider.models[0]);
      setStatus({ ok: true, text: translate(lang, 'testOk') });
    } catch (err: any) {
      setStatus({ ok: false, text: `${translate(lang, 'testFail')}: ${err?.message ?? err}`.slice(0, 160) });
    } finally {
      setBusy(null);
    }
  };

  const doFetch = async () => {
    setBusy('fetch');
    setStatus(null);
    try {
      const models = await fetchProviderModels(provider);
      if (models.length) onUpdate({ models });
      setStatus({
        ok: true,
        text: translate(lang, 'fetchOk').replace('{n}', String(models.length)),
      });
    } catch (err: any) {
      setStatus({ ok: false, text: `${translate(lang, 'testFail')}: ${err?.message ?? err}`.slice(0, 160) });
    } finally {
      setBusy(null);
    }
  };

  const addModel = () => {
    const m = newModel.trim();
    if (!m || provider.models.includes(m)) return;
    onUpdate({ models: [...provider.models, m] });
    setNewModel('');
  };

  const input =
    'w-full rounded-lg border border-black/15 bg-transparent px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/20 dark:focus:ring-white/15';

  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.1]">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <button
          className="flex h-5 w-5 items-center justify-center text-[#8f8f8f] transition-transform"
          onClick={() => setOpen((v) => !v)}
        >
          <IconChevronDown size={16} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
        <span className="flex-1 truncate text-sm font-medium">{provider.name}</span>
        <span className="rounded-md bg-black/[0.06] px-1.5 py-0.5 text-[10px] text-[#8f8f8f] dark:bg-white/10 dark:text-[#9b9b9b]">
          {isLocalProvider(provider) ? translate(lang, 'local') : provider.kind === 'anthropic' ? translate(lang, 'kindAnthropic') : translate(lang, 'kindOpenAI')}
        </span>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={provider.enabled}
            onChange={(e) => onUpdate({ enabled: e.target.checked })}
          />
          <span className="h-5 w-9 rounded-full bg-black/15 transition-colors peer-checked:bg-[#0d0d0d] dark:bg-white/20 dark:peer-checked:bg-[#ececec]" />
          <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4 dark:bg-[#212121]" />
        </label>
      </div>

      {open && (
        <div className="space-y-2.5 border-t border-black/[0.06] px-3 py-3 dark:border-white/[0.08]">
          <label className="block">
            <span className="mb-1 block text-xs text-[#8f8f8f] dark:text-[#9b9b9b]">
              {translate(lang, 'apiBaseUrl')}
            </span>
            <input
              className={input}
              value={provider.baseUrl}
              onChange={(e) => onUpdate({ baseUrl: e.target.value })}
              spellCheck={false}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-[#8f8f8f] dark:text-[#9b9b9b]">
              {isLocalProvider(provider) ? translate(lang, 'apiKeyOptional') : translate(lang, 'apiKey')}
            </span>
            <input
              className={input}
              type="password"
              value={provider.apiKey}
              onChange={(e) => onUpdate({ apiKey: e.target.value })}
              placeholder="sk-…"
              spellCheck={false}
            />
          </label>

          <div>
            <span className="mb-1 block text-xs text-[#8f8f8f] dark:text-[#9b9b9b]">
              {translate(lang, 'models')} · <span className="opacity-70">{translate(lang, 'modelsHint')}</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {provider.models.map((m) => (
                <span
                  key={m}
                  className="flex items-center gap-1 rounded-lg bg-black/[0.06] py-1 pl-2.5 pr-1 text-xs dark:bg-white/10"
                >
                  {m}
                  <button
                    className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/15"
                    onClick={() => onUpdate({ models: provider.models.filter((x) => x !== m) })}
                  >
                    <IconX size={11} />
                  </button>
                </span>
              ))}
            </div>
            <input
              className={`${input} mt-1.5`}
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addModel();
                }
              }}
              placeholder={translate(lang, 'addModelPlaceholder')}
              spellCheck={false}
            />
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <button className={btn} onClick={doFetch} disabled={busy !== null}>
              {busy === 'fetch' ? translate(lang, 'testing') : translate(lang, 'fetchModels')}
            </button>
            <button className={btn} onClick={doTest} disabled={busy !== null}>
              {busy === 'test' ? translate(lang, 'testing') : translate(lang, 'test')}
            </button>
            <div className="flex-1" />
            <button
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[#e02e2a] hover:bg-[#e02e2a]/10 dark:text-[#ff6f6b]"
              onClick={onRemove}
            >
              <IconTrash size={13} /> {translate(lang, 'deleteProvider')}
            </button>
          </div>

          {status && (
            <p
              className={`text-xs leading-relaxed ${
                status.ok ? 'text-[#0a8754] dark:text-[#4ade80]' : 'text-[#e02e2a] dark:text-[#ff6f6b]'
              }`}
            >
              {status.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function AddProviderForm({
  lang,
  onAdd,
}: {
  lang: Lang;
  onAdd: (p: Provider) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<ProviderKind>('openai');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState('');

  const input =
    'w-full rounded-lg border border-black/15 bg-transparent px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black/10 dark:border-white/20 dark:focus:ring-white/15';

  if (!open) {
    return (
      <button
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-black/20 py-2.5 text-sm text-[#5d5d5d] hover:bg-black/[0.04] dark:border-white/25 dark:text-[#b4b4b4] dark:hover:bg-white/[0.06]"
        onClick={() => setOpen(true)}
      >
        <IconPlus size={16} /> {translate(lang, 'addProvider')}
      </button>
    );
  }

  const submit = () => {
    onAdd({
      id: uid(),
      name: name.trim() || translate(lang, 'customProvider'),
      kind,
      baseUrl: baseUrl.trim(),
      apiKey,
      models: models.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      enabled: true,
    });
    setOpen(false);
    setName('');
    setBaseUrl('');
    setApiKey('');
    setModels('');
  };

  return (
    <div className="space-y-2.5 rounded-xl border border-black/[0.08] p-3 dark:border-white/[0.1]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{translate(lang, 'addProvider')}</span>
        <button className="rounded-lg p-1 hover:bg-black/[0.06] dark:hover:bg-white/10" onClick={() => setOpen(false)}>
          <IconX size={15} />
        </button>
      </div>
      <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder={translate(lang, 'providerName')} />
      <div className="flex gap-2">
        <select
          className="flex-1 rounded-lg border border-black/15 bg-transparent px-2.5 py-1.5 text-sm outline-none dark:border-white/20 dark:bg-[#2f2f2f]"
          value={kind}
          onChange={(e) => setKind(e.target.value as ProviderKind)}
        >
          <option value="openai">{translate(lang, 'kindOpenAI')}</option>
          <option value="anthropic">{translate(lang, 'kindAnthropic')}</option>
        </select>
        <select
          className="flex-1 rounded-lg border border-black/15 bg-transparent px-2.5 py-1.5 text-sm outline-none dark:border-white/20 dark:bg-[#2f2f2f]"
          value=""
          onChange={(e) => {
            const preset = PROVIDER_PRESETS.find((p) => p.id === e.target.value);
            if (preset) {
              setName(preset.name);
              setKind(preset.kind);
              setBaseUrl(preset.baseUrl);
              setModels(preset.models.join(', '));
            }
          }}
        >
          <option value="" disabled>
            {translate(lang, 'restorePresets')}
          </option>
          {PROVIDER_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <input className={input} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://…/v1" spellCheck={false} />
      <input className={input} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={translate(lang, 'apiKey')} type="password" spellCheck={false} />
      <input className={input} value={models} onChange={(e) => setModels(e.target.value)} placeholder={translate(lang, 'models')} spellCheck={false} />
      <button
        className="w-full rounded-xl bg-[#0d0d0d] py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-[#ececec] dark:text-[#0d0d0d]"
        onClick={submit}
      >
        {translate(lang, 'save')}
      </button>
    </div>
  );
}

export default function SettingsModal({
  lang,
  theme,
  providers,
  onClose,
  onSetTheme,
  onSetLang,
  onClearAll,
  onUpdateProvider,
  onAddProvider,
  onRemoveProvider,
}: Props) {
  const [tab, setTab] = useState<Tab>('providers');
  const [confirming, setConfirming] = useState(false);

  const themes: { id: AppState['theme']; key: TKey }[] = [
    { id: 'system', key: 'themeSystem' },
    { id: 'light', key: 'themeLight' },
    { id: 'dark', key: 'themeDark' },
  ];

  const row =
    'flex items-center justify-between gap-4 rounded-xl px-3 py-3 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]';

  const tabs: { id: Tab; key: TKey }[] = [
    { id: 'providers', key: 'modelProviders' },
    { id: 'general', key: 'general' },
    { id: 'data', key: 'dataControls' },
  ];

  return (
    <div
      className="no-drag fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <div
        className="flex h-[520px] w-[720px] max-w-[94vw] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.3)] dark:border-white/10 dark:bg-[#2f2f2f]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* left nav */}
        <div className="w-[180px] shrink-0 border-r border-black/[0.07] p-2.5 dark:border-white/[0.09]">
          <div className="px-2 pb-2 pt-1.5 text-[15px] font-semibold">{translate(lang, 'settings')}</div>
          {tabs.map((x) => (
            <button
              key={x.id}
              className={`w-full rounded-lg px-2.5 py-2 text-left text-sm ${
                tab === x.id
                  ? 'bg-black/[0.06] dark:bg-white/10'
                  : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              }`}
              onClick={() => {
                setTab(x.id);
                setConfirming(false);
              }}
            >
              {translate(lang, x.key)}
            </button>
          ))}
        </div>

        {/* content */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          <button
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/10"
            onClick={onClose}
          >
            <IconX size={17} />
          </button>

          {tab === 'providers' && (
            <div className="scroll-thin flex-1 space-y-2 overflow-y-auto p-4 pt-12">
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  lang={lang}
                  onUpdate={(patch) => onUpdateProvider(p.id, patch)}
                  onRemove={() => onRemoveProvider(p.id)}
                />
              ))}
              <AddProviderForm lang={lang} onAdd={onAddProvider} />
              <p className="px-1 pt-1 text-xs leading-relaxed text-[#8f8f8f] dark:text-[#9b9b9b]">
                {lang === 'zh'
                  ? '支持所有 OpenAI 兼容接口（OpenAI / DeepSeek / 智谱 / Kimi / 通义 / OpenRouter / Groq / Gemini 兼容模式）与 Anthropic 原生接口；本地模型可直接填 Ollama、LM Studio、llama.cpp 的地址，无需密钥。密钥仅保存在本机。'
                  : 'Works with every OpenAI-compatible endpoint (OpenAI / DeepSeek / GLM / Kimi / Qwen / OpenRouter / Groq / Gemini-compat) and the native Anthropic API. For local models just point to Ollama, LM Studio or llama.cpp — no key needed. Keys are stored locally only.'}
              </p>
            </div>
          )}

          {tab === 'general' && (
            <div className="flex-1 space-y-1 overflow-y-auto p-3 pt-12">
              <div className={row}>
                <span className="text-sm">{translate(lang, 'theme')}</span>
                <div className="flex rounded-xl bg-black/[0.06] p-0.5 dark:bg-white/[0.08]">
                  {themes.map((x) => (
                    <button
                      key={x.id}
                      className={`rounded-[10px] px-3 py-1.5 text-xs ${
                        theme === x.id
                          ? 'bg-white shadow-sm dark:bg-[#4a4a4a]'
                          : 'text-[#5d5d5d] dark:text-[#b4b4b4]'
                      }`}
                      onClick={() => onSetTheme(x.id)}
                    >
                      {translate(lang, x.key)}
                    </button>
                  ))}
                </div>
              </div>
              <div className={row}>
                <span className="text-sm">{translate(lang, 'language')}</span>
                <select
                  value={lang}
                  onChange={(e) => onSetLang(e.target.value as Lang)}
                  className="rounded-lg border border-black/15 bg-transparent px-2.5 py-1.5 text-sm outline-none dark:border-white/20 dark:bg-[#2f2f2f]"
                >
                  <option value="zh">简体中文</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          )}

          {tab === 'data' && (
            <div className="flex-1 space-y-1 overflow-y-auto p-3 pt-12">
              <div className={row}>
                <span className="text-sm">{translate(lang, 'clearAll')}</span>
                {confirming ? (
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-[#8f8f8f] dark:text-[#9b9b9b]">
                      {translate(lang, 'clearAllConfirm')}
                    </span>
                    <button
                      className="rounded-lg px-2.5 py-1.5 text-xs hover:bg-black/[0.06] dark:hover:bg-white/10"
                      onClick={() => setConfirming(false)}
                    >
                      {translate(lang, 'cancel')}
                    </button>
                    <button
                      className="rounded-lg bg-[#e02e2a] px-2.5 py-1.5 text-xs text-white hover:opacity-90"
                      onClick={() => {
                        onClearAll();
                        setConfirming(false);
                      }}
                    >
                      {translate(lang, 'confirm')}
                    </button>
                  </span>
                ) : (
                  <button
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-[#e02e2a] hover:bg-[#e02e2a]/10 dark:text-[#ff6f6b]"
                    onClick={() => setConfirming(true)}
                  >
                    <IconTrash size={16} />
                    {translate(lang, 'clearAll')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
