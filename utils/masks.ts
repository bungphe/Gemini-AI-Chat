
import { Mask, ChatMessage } from '../types';
import { nanoid } from 'nanoid';
import { GEMINI_TEXT_MODEL } from '../constants';
import { useAppConfigStore } from '../store/useAppConfigStore';

export const DEFAULT_MASK_AVATAR = "🤖";

export function createEmptyMask(): Mask {
  // Get global model config to use as a base for new masks
  const globalModelConfig = useAppConfigStore.getState().modelConfig;
  return {
    id: nanoid(),
    avatar: DEFAULT_MASK_AVATAR,
    name: "New Mask",
    context: [] as ChatMessage[],
    syncGlobalConfig: true, // Default to syncing with global, can be overridden
    modelConfig: { ...globalModelConfig, model: GEMINI_TEXT_MODEL, temperature: 0.7 }, // Ensure a default model and temp
    createdAt: Date.now(),
    builtin: false,
  };
}

export const BUILTIN_MASKS: Mask[] = [
  {
    id: "builtin-general-assistant",
    avatar: "🧑‍🚀",
    name: "General Assistant",
    context: [
      { id: nanoid(), role: "system", content: "You are a helpful general-purpose AI assistant.", date: new Date().toISOString() }
    ],
    modelConfig: { model: GEMINI_TEXT_MODEL, temperature: 0.7 },
    createdAt: Date.now() - 10000, // ensure it's older
    builtin: true,
    syncGlobalConfig: true,
  },
  {
    id: "builtin-code-helper",
    avatar: "💻",
    name: "Code Helper",
    context: [
      { id: nanoid(), role: "system", content: "You are an expert software developer. Provide concise and accurate code assistance. When providing code, specify the language.", date: new Date().toISOString() }
    ],
    modelConfig: { model: GEMINI_TEXT_MODEL, temperature: 0.5 },
    createdAt: Date.now() - 20000,
    builtin: true,
    syncGlobalConfig: true,
  },
  {
    id: "builtin-story-teller",
    avatar: "📖",
    name: "Story Teller",
    context: [
      { id: nanoid(), role: "system", content: "You are a creative storyteller. Weave engaging narratives based on the user's prompts.", date: new Date().toISOString() }
    ],
    modelConfig: { model: GEMINI_TEXT_MODEL, temperature: 0.9 },
    createdAt: Date.now() - 30000,
    builtin: true,
    syncGlobalConfig: true,
  },
];
