
import { get, set, del, clear, createStore } from 'idb-keyval';

// Safe localStorage access
export function safeLocalStorage(): Storage {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  // Fallback to a mock storage if localStorage is not available
  const mockStorage: Record<string, string> = {};
  return {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); },
    key: (index: number) => Object.keys(mockStorage)[index] || null,
    get length() { return Object.keys(mockStorage).length; }
  };
}

// Wrapper for idb-keyval to be used with Zustand's createJSONStorage
const customStore = createStore('gemini-chat-db', 'keyval-store');

export const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // console.log('[IDB] getItem', name);
    const value = await get(name, customStore);
    return value === undefined ? null : value; // Zustand expects null for missing items
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // console.log('[IDB] setItem', name, value);
    await set(name, value, customStore);
  },
  removeItem: async (name: string): Promise<void> => {
    // console.log('[IDB] removeItem', name);
    await del(name, customStore);
  },
};

// Example usage for clearing all idb-keyval stores if needed (e.g., for a hard reset)
export async function clearAllIdbStorage() {
  await clear(customStore);
  console.log('[IDB] All data cleared from idb-keyval store.');
}
