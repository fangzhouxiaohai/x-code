<p align="center">
  <img src="build/icon.png" width="128" alt="X-Code" />
</p>

<h1 align="center">X-Code</h1>

<p align="center">
  免费开源的 AI 对话桌面应用 · Windows & macOS<br/>
  Electron + React + TypeScript + Tailwind CSS
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-blue" alt="platform" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license" />
</p>

**无需登录，数据全部保存在本机。** 通过「模型供应商」接入你自己的模型：
支持主流云厂商与本地 llama.cpp / Ollama / LM Studio，也内置离线演示模型，零配置即可上手。

## ✨ 功能

| 模块 | 说明 |
| --- | --- |
| 窗口外观 | macOS 红绿灯按钮嵌入侧栏（`hiddenInset`）；Windows 自定义最小化/最大化/关闭按钮，无边框可拖拽 |
| 侧边栏 | 新对话 / 搜索对话 / 资源库 / Sora / GPTs、按「今天 / 昨天 / 过去 7 天…」分组的历史记录、悬浮 `…` 菜单（分享、重命名、归档、删除） |
| 模型选择器 | 顶部 X-Code 下拉：内置离线演示模型 + 已启用的供应商模型按组展示，`管理模型供应商…` 一键直达设置 |
| 空状态 | 居中「今天想聊点什么？」+ 大输入框 |
| 输入框 | 自动增高、「+」上传附件（文件/图片 chips）、工具下拉（创建图像/联网搜索/深度研究/思考更久）、麦克风、语音波形按钮、发送/停止切换 |
| 对话流 | 用户气泡 + Markdown 助手回答（代码块、表格、引用、列表）、流式打字光标、悬浮操作栏（复制 / 点赞 / 点踩 / 朗读 TTS / 重新生成） |
| 搜索 | `Ctrl/Cmd + K` 全局搜索弹窗（标题与正文模糊匹配、最近对话、↵ 打开） |
| 设置 | 模型供应商 / 通用（主题：跟随系统·浅色·深色；语言：简体中文·English）/ 数据控制（删除所有对话） |
| 快捷键 | `Ctrl/Cmd+N` 新对话、`Ctrl/Cmd+K` 搜索、`Ctrl/Cmd+B` 收起侧栏、`Enter` 发送、`Shift+Enter` 换行 |
| 持久化 | 全部会话、供应商配置、主题、语言保存在本地 `localStorage` |

## 🔌 模型供应商（自定义接入）

设置 → **模型供应商**，内置以下预置（一键填入，填 API Key 即用）：

- **云端**：OpenAI、Anthropic（原生 Messages API）、Google Gemini（OpenAI 兼容模式）、
  DeepSeek、智谱 GLM、Moonshot Kimi、阿里通义 Qwen、OpenRouter、Groq
- **本地**：Ollama（`http://localhost:11434/v1`）、LM Studio（`:1234/v1`）、llama.cpp（`:8080/v1`）——无需密钥
- **自定义**：任意 OpenAI 兼容端点或 Anthropic 兼容端点（名称 / 类型 / Base URL / Key / 模型全可编辑）

能力：按供应商分组选择模型、「获取模型列表」自动拉取 `/models`、「测试连接」快速验证、
启用开关、随时删除；流式输出支持中途「停止」，请求失败会把错误信息显示在对话里。
API Key 仅保存在本机浏览器存储，不会上传。

> 未配置任何供应商时，应用使用**离线演示模型**（本地模拟流式回复）。
> 开发时可用 `node scripts/mock-llm-server.mjs` 起一个本地 OpenAI 兼容 SSE 服务（`:9911/v1`）做端到端联调。

## 🚀 开发运行

```bash
npm install
npm run dev        # 启动 Vite 开发服务器 + Electron 窗口（热更新）
```

> npm 12 默认禁止依赖安装脚本。若提示 *Electron failed to install correctly*，
> 执行 `cd node_modules/electron && node install.js` 下载二进制。

## 🎨 LOGO 与应用图标

`src/components/icons.tsx` 中的 `XCodeLogo` 是原创几何「六瓣结」图形（六个圆角臂旋转互锁）。
应用图标由 `npm run icon` 通过 Electron 离屏渲染自动生成为 `build/icon.png`
（512×512、透明圆角、深色底），electron-builder 会自动转换为 Windows `.ico` 与 macOS `.icns`。

## 📦 打包分发

```bash
npm run dist:win   # Windows：NSIS 安装包 → release/X-Code-1.0.0-Setup.exe
npm run dist:mac   # macOS：DMG（x64 + arm64）→ release/*.dmg（需在 macOS 上执行）
```

macOS 打包需在 macOS 机器（或 CI）上执行；本项目附带 GitHub Actions 工作流，
push `v*` 标签后在 Windows 与 macOS 双平台自动构建，并把安装包附加到对应的 GitHub Release。

## 🗂 目录结构

```
electron/          主进程与预加载脚本（无边框窗口、窗口控制 IPC、CORS 处理、截图自测钩子）
src/
  components/      Sidebar / TopBar / ChatView / Message / Composer / 弹窗 / 图标库
  lib/
    llm.ts         OpenAI 兼容 + Anthropic 原生 SSE 流式客户端、模型列表、连接测试
    providers.ts   内置供应商预置
    store.ts       状态与持久化（会话/供应商/主题/语言）
    mockAI.ts      离线演示引擎
    i18n.ts        简体中文 / English 文案
scripts/           dev.mjs（开发编排）、make-icon.cjs（图标离屏渲染）、mock-llm-server.mjs（联调用）
build/icon.png     应用图标（npm run icon 生成）
```

## 📮 联系作者 / Contact

- 邮箱 / Email：**24519660@qq.com**
- 微信 / WeChat：扫码添加好友

<p align="center">
  <img src="docs/wechat-qrcode.jpg" width="260" alt="微信二维码" />
</p>

## 📄 许可

MIT（见 [LICENSE](./LICENSE)）
