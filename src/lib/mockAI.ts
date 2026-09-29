import type { ModelId } from '../types';

const CJK = /[\u4e00-\u9fff]/;

export function isChinese(text: string): boolean {
  return CJK.test(text);
}

interface Answer {
  keywords: string[];
  zh: string;
  en: string;
}

const ANSWERS: Answer[] = [
  {
    keywords: ['你好', 'hello', 'hi', '嗨', 'hey'],
    zh: `你好！👋 很高兴见到你。我可以帮你：

- **回答问题** —— 从生活小常识到技术难题
- **写作与翻译** —— 邮件、报告、文章润色
- **编程辅助** —— 写代码、调试、解释原理
- **头脑风暴** —— 一起想点子、做计划

有什么想聊的，尽管开口！`,
    en: `Hello! 👋 Great to see you. I can help you with:

- **Answering questions** — from everyday trivia to hard technical problems
- **Writing & translation** — emails, reports, polishing prose
- **Coding** — writing, debugging, and explaining code
- **Brainstorming** — ideas, plans, and everything in between

Just ask away!`,
  },
  {
    keywords: ['你是谁', 'who are you', '你叫什么', '介绍', 'about you'],
    zh: `我是 **X-Code** 桌面应用内置的演示助手——一个免费开源、无需登录的本地 AI 对话客户端。

我可以帮你思考、写作、编程、学习新东西，或者只是陪你聊天。当前对话完全保存在本地，随时可以搜索、重命名或删除。在「设置 → 模型供应商」里接入真实模型后，回答会由你选择的模型生成。`,
    en: `I'm the built-in demo assistant of **X-Code** — a free, open-source desktop AI chat client that needs no login.

I can help you think, write, code, and learn. Everything here is stored locally, so you can search, rename, or delete any chat at any time. Connect a real model in Settings → Model providers to get answers from your own model.`,
  },
  {
    keywords: ['代码', 'code', 'react', '组件', 'component', '写个', '编程'],
    zh: `好的，这是一个使用 React 和 TypeScript 编写的计数器组件：

\`\`\`tsx
import { useState } from 'react';

export function Counter({ start = 0 }: { start?: number }) {
  const [count, setCount] = useState(start);

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setCount((c) => c - 1)}>-</button>
      <span className="font-mono text-lg">{count}</span>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}
\`\`\`

**要点说明：**

1. \`useState\` 保存当前计数值，初始值为 \`start\`
2. 更新函数使用 \`c => c ± 1\` 的形式，避免闭包旧值问题
3. 按钮样式可以换成任意 UI 库的组件

需要我加上持久化或者步长设置吗？`,
    en: `Sure! Here's a counter component in React + TypeScript:

\`\`\`tsx
import { useState } from 'react';

export function Counter({ start = 0 }: { start?: number }) {
  const [count, setCount] = useState(start);

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setCount((c) => c - 1)}>-</button>
      <span className="font-mono text-lg">{count}</span>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}
\`\`\`

**Key points:**

1. \`useState\` holds the value, initialized with \`start\`
2. Updater functions use \`c => c ± 1\` to avoid stale closures
3. Swap the buttons for any UI library you like

Want me to add persistence or a step-size prop?`,
  },
  {
    keywords: ['诗', 'poem', '写一首', 'poetry'],
    zh: `好的，为你写一首小诗：

**《窗前》**

> 夜色把屏幕调成暖光，
> 光标在句末安静眨眼。
> 你敲下的问题像一颗石子，
> 沉入语言的深水，激起回声。
>
> 我把万千词句过秤，
> 只挑出最轻的几句——
> 轻得刚好，能浮上你眉梢，
> 成为一个笑。

要不要换个主题，或者来一首五言绝句？`,
    en: `Here's a short poem for you:

**"Before the Window"**

> Night tunes the screen to amber,
> the cursor blinks at the end of a line.
> Your question drops like a pebble
> into deep water, ringing echoes.
>
> I weigh ten thousand words
> and keep only the lightest few —
> light enough to float up to your brow
> and become a smile.

Want a different theme, or a haiku?`,
  },
  {
    keywords: ['计划', 'plan', '怎么学', 'learn', '入门', 'roadmap'],
    zh: `这取决于目标，但我可以给一个通用的四步框架：

### 1. 明确终点
把「学会 X」改写成可验证的结果，例如：*能独立完成一个小项目*。

### 2. 拆解里程碑
| 阶段 | 目标 | 建议时长 |
| --- | --- | --- |
| 基础 | 掌握核心概念 | 1–2 周 |
| 练习 | 做小练习题 | 2–3 周 |
| 项目 | 完成一个真实小项目 | 2–4 周 |
| 深化 | 阅读进阶材料、复盘 | 持续 |

### 3. 每天固定投入
每天 45 分钟，胜过周末突击 5 小时。

### 4. 以教代学
把学到的东西讲给别人（或写成笔记），检验真实理解程度。

告诉我你想学的具体主题，我可以把计划展开到每一周。`,
    en: `It depends on the goal, but here's a general four-step framework:

### 1. Define the finish line
Turn "learn X" into a verifiable outcome, e.g. *build a small project on my own*.

### 2. Break it into milestones
| Phase | Goal | Suggested time |
| --- | --- | --- |
| Basics | Core concepts | 1–2 weeks |
| Practice | Small exercises | 2–3 weeks |
| Project | A real mini-project | 2–4 weeks |
| Deepen | Advanced reading, review | ongoing |

### 3. Show up daily
45 minutes a day beats a 5-hour weekend cram.

### 4. Learn by teaching
Explain what you learned to someone (or write notes) to test real understanding.

Tell me the specific topic and I'll expand this into a week-by-week plan.`,
  },
];

const FALLBACK = [
  {
    zh: `这是个有意思的问题。让我从几个角度来回答：

**首先**，理解问题的本质比急着找答案更重要。很多问题在定义清楚之后，答案会自然浮现。

**其次**，可以试试把这些拆成更小的问题：
1. 你想达成的最终目标是什么？
2. 目前已经尝试过哪些方法？
3. 约束条件（时间、成本、工具）有哪些？

如果你给我更多背景信息，我可以给出更具体、更有针对性的回答。`,
    en: `Interesting question! Let me approach it from a few angles:

**First**, understanding the essence of the question matters more than rushing to an answer. Many questions answer themselves once they're clearly defined.

**Second**, try breaking it into smaller questions:
1. What's the end goal you're aiming for?
2. What have you already tried?
3. What are the constraints (time, budget, tools)?

Give me a bit more context and I can give a much more specific answer.`,
  },
  {
    zh: `我来帮你梳理一下。

> 好的回答始于好的问题。

针对你的问题，我的建议是：

- **从小处着手** —— 先做一个能跑起来的最小版本，再逐步完善
- **保持简单** —— 复杂方案往往在简单方案被证明不够用之前都不必要
- **及时反馈** —— 每一步都验证结果，避免在错误方向上走太远

你更想深入讨论哪一点？我可以展开讲讲。`,
    en: `Let me help you structure this.

> Good answers begin with good questions.

For your question, my suggestion:

- **Start small** — build a minimal working version first, then refine
- **Keep it simple** — complexity is rarely justified before simplicity has failed
- **Feedback fast** — verify each step so you don't go far down the wrong path

Which point would you like me to expand on?`,
  },
];

const THINKING_LINE: Record<ModelId, string> = {
  auto: '',
  instant: '',
  thinking: 'Thought for 4 seconds',
  gpt4o: '',
};

export function pickAnswer(userText: string, model: ModelId): { text: string; thinking: string } {
  const zh = isChinese(userText);
  const lower = userText.toLowerCase();
  const hit = ANSWERS.find((a) => a.keywords.some((k) => lower.includes(k.toLowerCase())));
  const base = hit ? (zh ? hit.zh : hit.en) : (() => {
    const f = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
    return zh ? f.zh : f.en;
  })();
  return { text: base, thinking: THINKING_LINE[model] ?? '' };
}

/** Split text into stream chunks: words for latin text, ~2 chars for CJK. */
export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (CJK.test(ch)) {
      chunks.push(text.slice(i, i + 2));
      i += 2;
    } else if (/\s/.test(ch)) {
      let j = i;
      while (j < text.length && /\s/.test(text[j])) j++;
      chunks.push(text.slice(i, j));
      i = j;
    } else {
      let j = i;
      while (j < text.length && !CJK.test(text[j]) && !/\s/.test(text[j])) j++;
      chunks.push(text.slice(i, j));
      i = j;
    }
  }
  return chunks;
}
