export type Role = 'user' | 'assistant';

export interface Attachment {
  id: string;
  name: string;
  kind: 'file' | 'image';
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  thinking?: string;
  attachments?: Attachment[];
  tool?: string | null;
  streaming?: boolean;
  feedback?: 'up' | 'down' | null;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type ModelId = 'auto' | 'instant' | 'thinking' | 'gpt4o';

export type ThemeSetting = 'system' | 'light' | 'dark';

export type Lang = 'zh' | 'en';

/** 'openai'  = any OpenAI-compatible chat-completions endpoint
 *  'anthropic' = Anthropic native /v1/messages API */
export type ProviderKind = 'openai' | 'anthropic';

export interface Provider {
  id: string;
  name: string;
  kind: ProviderKind;
  baseUrl: string;
  apiKey: string;
  models: string[];
  enabled: boolean;
  builtin?: boolean;
}

export interface ModelSelection {
  providerId: string; // 'demo' = built-in offline mock engine
  model: string;
}

export interface AppState {
  conversations: Conversation[];
  activeId: string | null;
  activeModel: ModelSelection;
  providers: Provider[];
  theme: ThemeSetting;
  lang: Lang;
  sidebarOpen: boolean;
}
