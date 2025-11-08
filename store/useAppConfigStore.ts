
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Theme } from '../types';
import { StoreKey, GEMINI_TEXT_MODEL } from '../constants';
import { LLMModel }
 from '../types'; // For future model list management
import { idbStorage } from '../utils/localStorage';

export interface ModelConfig {
  model: string;
  temperature: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  // Add other model-specific configs here
}

interface AppConfigState {
  theme: Theme;
  fontSize: number;
  fontFamily: string;
  
  modelConfig: ModelConfig;
  models: LLMModel[]; // For listing available models in settings, if needed

  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (font: string) => void;
  setModelConfig: (updater: (config: ModelConfig) => ModelConfig) => void;
  // addModels: (models: LLMModel[]) => void; // For dynamically adding/updating models
}

export const useAppConfigStore = create<AppConfigState>()(
  persist(
    (set) => ({
      theme: Theme.Auto,
      fontSize: 14,
      fontFamily: 'sans-serif', // A generic sans-serif font
      
      modelConfig: {
        model: GEMINI_TEXT_MODEL,
        temperature: 0.7,
        topP: 1,
        maxOutputTokens: 2048,
      },
      models: [], // Initialize with an empty array or default models

      setTheme: (theme) => set({ theme }),
      setFontSize: (size) => set({ fontSize: size }),
      setFontFamily: (font) => set({ fontFamily: font }),
      setModelConfig: (updater) => set((state) => ({ modelConfig: updater(state.modelConfig) })),
      // addModels: (newModels) => set((state) => ({ models: [...state.models, ...newModels] })),
    }),
    {
      name: StoreKey.Config,
      storage: createJSONStorage(() => idbStorage), 
      onRehydrateStorage: (state) => {
        return (hydratedState, error) => {
          if (error) {
            console.error("An error occurred during AppConfigStore hydration:", error);
          } else if (hydratedState) {
             // You can add migration logic here if needed
            if (hydratedState.theme === undefined) hydratedState.theme = Theme.Auto;
            if (hydratedState.fontSize === undefined) hydratedState.fontSize = 14;
            if (hydratedState.fontFamily === undefined) hydratedState.fontFamily = 'sans-serif';
            if (hydratedState.modelConfig === undefined) hydratedState.modelConfig = {
                model: GEMINI_TEXT_MODEL,
                temperature: 0.7,
                topP: 1,
                maxOutputTokens: 2048,
            };
          }
        };
      },
    }
  )
);
