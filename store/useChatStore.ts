
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChatMessage, ChatSession, Mask, Role } from '../types';
import { StoreKey, DEFAULT_CHAT_TITLE, GEMINI_TEXT_MODEL } from '../constants';
import { nanoid } from 'nanoid';
import { idbStorage } from '../utils/localStorage';
import { geminiService } from '../services/geminiService';
import { useMaskStore } from './useMaskStore';
import { useAppConfigStore } from './useAppConfigStore';


interface ChatState {
  sessions: ChatSession[];
  currentSessionIndex: number;
  isLoading: boolean; // To indicate if a response is being fetched
  
  newSession: (mask?: Mask) => string; // Returns new session ID
  selectSession: (index: number) => void;
  deleteSession: (index: number) => void;
  currentSession: () => ChatSession | undefined;
  updateCurrentSession: (updater: (session: ChatSession) => void) => void;
  
  onUserSubmit: (sessionId: string, content: string, imageBase64?: string) => Promise<void>;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateMessage: (sessionId: string, messageId: string, updater: (message: ChatMessage) => ChatMessage) => void;
  clearCurrentChat: () => void;
  updateSessionTopic: (sessionId: string, topic: string) => void;
}

const createNewMessage = (role: Role, content: string | any[], id?: string): ChatMessage => ({ // content can be any for multimodal
  id: id || nanoid(),
  date: new Date().toISOString(),
  role,
  content,
});

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionIndex: -1,
      isLoading: false,

      newSession: (mask) => {
        const appConfig = useAppConfigStore.getState().modelConfig;
        const selectedMask = mask || useMaskStore.getState().defaultMask; 
        
        const newSession: ChatSession = {
          id: nanoid(),
          topic: selectedMask?.name || DEFAULT_CHAT_TITLE,
          messages: selectedMask?.context.length ? [...selectedMask.context] : [],
          mask: selectedMask || { // Fallback if no mask/defaultMask
            id: 'default',
            name: 'Default',
            avatar: '🤖',
            context: [],
            createdAt: Date.now(),
            modelConfig: { ...appConfig }, // Use global config
            syncGlobalConfig: true,
          },
          lastUpdate: Date.now(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionIndex: 0,
        }));
        return newSession.id;
      },

      selectSession: (index) => set({ currentSessionIndex: index }),

      deleteSession: (index) => {
        set((state) => {
          const sessions = [...state.sessions];
          sessions.splice(index, 1);
          let newIndex = state.currentSessionIndex;
          if (index === state.currentSessionIndex) {
            newIndex = Math.max(0, sessions.length - 1);
          } else if (index < state.currentSessionIndex) {
            newIndex = state.currentSessionIndex -1;
          }
          if(sessions.length === 0){ // if all sessions deleted
            const newId = get().newSession(); // create a new one
            return { sessions: [useChatStore.getState().sessions.find(s => s.id === newId)!], currentSessionIndex: 0 };
          }
          return { sessions, currentSessionIndex: newIndex };
        });
      },
      
      currentSession: () => {
        const { sessions, currentSessionIndex } = get();
        if (currentSessionIndex >= 0 && currentSessionIndex < sessions.length) {
          return sessions[currentSessionIndex];
        }
        // If no session is active or index is out of bounds, create one if none exist
        if (sessions.length === 0) {
            get().newSession(); // This will update the state and then currentSession will return the new one
            return get().sessions[0]; // Return the newly created session
        }
        // If sessions exist but index is bad, select the first one
        if (sessions.length > 0 && (currentSessionIndex === -1 || currentSessionIndex >= sessions.length) ) {
            set({ currentSessionIndex: 0 });
            return sessions[0];
        }
        return undefined;
      },
      
      updateCurrentSession: (updater) => {
        set((state) => {
          const sessions = [...state.sessions];
          const currentSession = sessions[state.currentSessionIndex];
          if (currentSession) {
            updater(currentSession);
            currentSession.lastUpdate = Date.now();
          }
          return { sessions };
        });
      },

      onUserSubmit: async (sessionId, content, imageBase64) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session) return;

        set({ isLoading: true });

        const userMessageContent: any[] = [{ type: "text", text: content }];
        if (imageBase64) {
          // Assuming imageBase64 is like "data:image/jpeg;base64,..."
          userMessageContent.push({ type: "image_url", image_url: { url: imageBase64 } });
        }
        
        const userMessage = createNewMessage('user', userMessageContent);
        get().addMessage(sessionId, userMessage);

        const assistantMessageId = nanoid();
        const assistantMessagePlaceholder = createNewMessage('assistant', 'Thinking...', assistantMessageId);
        assistantMessagePlaceholder.streaming = true;
        get().addMessage(sessionId, assistantMessagePlaceholder);

        const history = [...session.mask.context, ...session.messages.slice(0, -1), userMessage]; // Use updated messages

        await geminiService.generateText({
          messages: history,
          model: session.mask.modelConfig.model || GEMINI_TEXT_MODEL,
          temperature: session.mask.modelConfig.temperature,
          topP: session.mask.modelConfig.topP,
          maxOutputTokens: session.mask.modelConfig.maxOutputTokens,
          onStreamUpdate: (chunk) => {
            get().updateMessage(sessionId, assistantMessageId, (msg) => {
              if(msg.content === 'Thinking...') msg.content = '';
              msg.content = (typeof msg.content === 'string' ? msg.content : '') + chunk;
              msg.streaming = true;
              return msg;
            });
          },
          onStreamFinish: (fullText) => {
             get().updateMessage(sessionId, assistantMessageId, (msg) => {
                msg.content = fullText;
                msg.streaming = false;
                msg.date = new Date().toISOString(); // Update date on finish
                return msg;
              });
             set({ isLoading: false });
          },
          onError: (error) => {
            get().updateMessage(sessionId, assistantMessageId, (msg) => {
              msg.content = `Error: ${error.message}`;
              msg.isError = true;
              msg.streaming = false;
              return msg;
            });
            set({ isLoading: false });
          },
        });
      },

      addMessage: (sessionId, message) => {
        get().updateCurrentSession(session => {
          if (session.id === sessionId) {
            session.messages = [...session.messages, message];
          }
        });
      },
      
      updateMessage: (sessionId, messageId, updater) => {
        get().updateCurrentSession(session => {
           if (session.id === sessionId) {
            const messageIndex = session.messages.findIndex(m => m.id === messageId);
            if (messageIndex !== -1) {
              session.messages[messageIndex] = updater(session.messages[messageIndex]);
            }
          }
        });
      },

      clearCurrentChat: () => {
        const currentSession = get().currentSession();
        if (currentSession) {
          get().updateCurrentSession(session => {
            session.messages = [];
            session.lastSummarizeIndex = 0;
            session.memoryPrompt = "";
          });
        }
      },
      updateSessionTopic: (sessionId, topic) => {
         get().updateCurrentSession(session => {
          if (session.id === sessionId) {
            session.topic = topic;
          }
        });
      }

    }),
    {
      name: StoreKey.Chat,
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: (state) => {
        return (hydratedState, error) => {
          if (error) {
            console.error("An error occurred during ChatStore hydration:", error);
          } else if (hydratedState) {
             if (hydratedState.sessions === undefined || hydratedState.sessions.length === 0) {
                hydratedState.sessions = []; // Ensure it's an array
                useChatStore.getState().newSession(); // Create a default session if empty
             }
             if (hydratedState.currentSessionIndex === undefined || hydratedState.currentSessionIndex < 0 || hydratedState.currentSessionIndex >= hydratedState.sessions.length) {
                hydratedState.currentSessionIndex = 0;
             }
             if (hydratedState.sessions.length > 0 && hydratedState.sessions[0].id === undefined) {
                // very old data, clear it
                hydratedState.sessions = [];
                useChatStore.getState().newSession();
             }
          }
        };
      },
    }
  )
);
