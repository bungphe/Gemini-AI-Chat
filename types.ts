
import { ModelConfig } from './store/useAppConfigStore';

export enum Theme {
  Auto = "auto",
  Light = "light",
  Dark = "dark",
}

export type Role = "user" | "assistant" | "system";

export interface MultimodalContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string; // Can be base64 data URI
  };
}

export interface ChatMessage {
  id: string;
  date: string;
  role: Role;
  content: string | MultimodalContent[];
  streaming?: boolean;
  isError?: boolean;
  model?: string; 
}

export interface Mask {
  id: string;
  createdAt: number;
  avatar: string;
  name: string;
  hideContext?: boolean;
  context: ChatMessage[];
  syncGlobalConfig?: boolean;
  modelConfig: ModelConfig;
  lang?: string; // For future i18n of masks
  builtin?: boolean;
}

export interface ChatSession {
  id: string;
  topic: string;
  messages: ChatMessage[];
  mask: Mask;
  lastUpdate: number;
  // For future features like summarization
  memoryPrompt?: string; 
  lastSummarizeIndex?: number;
  clearContextIndex?: number;
}

export interface LLMUsage {
  used: number;
  total: number;
}

export interface LLMModel {
  name: string;
  displayName?: string;
  available: boolean;
  provider: LLMModelProvider;
}

export interface LLMModelProvider {
  id: string;
  providerName: string;
  providerType: string;
}
