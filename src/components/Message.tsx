import { useMemo, useState } from 'react';
import { marked } from 'marked';
import type { Lang, Message } from '../types';
import { t as translate } from '../lib/i18n';
import {
  IconCheck,
  IconCopy,
  IconRefresh,
  IconSpeaker,
  IconThumbDown,
  IconThumbUp,
} from './icons';

marked.setOptions({ breaks: true, gfm: true });

function ActionBar({
  msg,
  lang,
  onRegenerate,
  onFeedback,
}: {
  msg: Message;
  lang: Lang;
  onRegenerate: () => void;
  onFeedback: (v: 'up' | 'down') => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const speak = () => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      if (synth.speaking) {
        synth.cancel();
        return;
      }
      const u = new SpeechSynthesisUtterance(
        msg.content.replace(/```[\s\S]*?```/g, '').replace(/[*#>`|-]/g, '')
      );
      u.lang = /[\u4e00-\u9fff]/.test(msg.content) ? 'zh-CN' : 'en-US';
      synth.speak(u);
    } catch {
      /* speech unavailable */
    }
  };

  const btn =
    'flex h-8 w-8 items-center justify-center rounded-lg text-[#5d5d5d] hover:bg-black/[0.06] dark:text-[#b4b4b4] dark:hover:bg-white/10 transition-colors';

  return (
    <div className="mt-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      <button className={btn} title={copied ? translate(lang, 'copied') : translate(lang, 'copy')} onClick={copy}>
        {copied ? <IconCheck size={17} /> : <IconCopy size={17} />}
      </button>
      <button
        className={`${btn} ${msg.feedback === 'up' ? 'text-[#0d0d0d] dark:text-[#ececec]' : ''}`}
        title={translate(lang, 'goodResponse')}
        onClick={() => onFeedback('up')}
      >
        <IconThumbUp size={17} />
      </button>
      <button
        className={`${btn} ${msg.feedback === 'down' ? 'text-[#0d0d0d] dark:text-[#ececec]' : ''}`}
        title={translate(lang, 'badResponse')}
        onClick={() => onFeedback('down')}
      >
        <IconThumbDown size={17} />
      </button>
      <button className={btn} title={translate(lang, 'readAloud')} onClick={speak}>
        <IconSpeaker size={17} />
      </button>
      <button className={btn} title={translate(lang, 'regenerate')} onClick={onRegenerate}>
        <IconRefresh size={17} />
      </button>
    </div>
  );
}

export default function MessageRow({
  msg,
  lang,
  onRegenerate,
  onFeedback,
}: {
  msg: Message;
  lang: Lang;
  onRegenerate: () => void;
  onFeedback: (v: 'up' | 'down') => void;
}) {
  const html = useMemo(() => marked.parse(msg.content) as string, [msg.content]);

  if (msg.role === 'user') {
    return (
      <div className="group flex flex-col items-end py-2.5">
        {msg.tool && (
          <span className="mb-1.5 rounded-full border border-black/10 px-2.5 py-0.5 text-xs text-[#8f8f8f] dark:border-white/15 dark:text-[#9b9b9b]">
            {msg.tool}
          </span>
        )}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="mb-1.5 flex flex-wrap justify-end gap-1.5">
            {msg.attachments.map((a) => (
              <span
                key={a.id}
                className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-black/[0.03] px-2.5 py-1 text-xs dark:border-white/15 dark:bg-white/[0.06]"
              >
                {a.kind === 'image' ? '🖼️' : '📄'} <span className="max-w-[180px] truncate">{a.name}</span>
              </span>
            ))}
          </div>
        )}
        <div className="max-w-[70%] whitespace-pre-wrap rounded-3xl bg-[#e8e8e8] px-5 py-2.5 text-[16px] leading-6 dark:bg-[#303030]">
          {msg.content}
        </div>
      </div>
    );
  }

  const thinking =
    msg.streaming && !msg.content && !msg.thinking ? (
      <span className="spark">✦</span>
    ) : null;

  return (
    <div className="group flex flex-col py-2.5">
      {msg.thinking && (
        <button className="mb-2 flex w-fit items-center gap-1.5 rounded-full border border-black/10 px-2.5 py-1 text-xs text-[#8f8f8f] hover:bg-black/[0.04] dark:border-white/15 dark:text-[#9b9b9b] dark:hover:bg-white/[0.06]">
          <span>💭</span>
          {msg.thinking}
        </button>
      )}
      {thinking}
      {msg.content && (
        <div
          className={`markdown text-[16px] leading-[1.75] ${msg.streaming ? 'streaming' : ''}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
      {!msg.streaming && <ActionBar msg={msg} lang={lang} onRegenerate={onRegenerate} onFeedback={onFeedback} />}
    </div>
  );
}
