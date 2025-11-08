
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Mask } from '../types';
import { StoreKey, GEMINI_TEXT_MODEL } from '../constants';
import { nanoid } from 'nanoid';
import { idbStorage } from '../utils/localStorage';
import { createEmptyMask as createEmptyMaskUtil, BUILTIN_MASKS } from '../utils/masks'; // Assuming a util for empty mask

interface MaskState {
  masks: Record<string, Mask>;
  defaultMask?: Mask; // Optional: a default mask to use
  
  addMask: (mask: Mask) => void;
  getMask: (id: string) => Mask | undefined;
  getAllMasks: () => Mask[];
  updateMask: (id: string, updater: (mask: Mask) => Mask) => void;
  deleteMask: (id: string) => void;
  setDefaultMask: (maskId: string) => void;
  searchMasks: (query: string) => Mask[];
}

export const useMaskStore = create<MaskState>()(
  persist(
    (set, get) => ({
      masks: {},
      defaultMask: undefined,

      addMask: (mask) => {
        set((state) => ({
          masks: { ...state.masks, [mask.id]: mask },
        }));
      },
      getMask: (id) => get().masks[id],
      getAllMasks: () => Object.values(get().masks).sort((a, b) => b.createdAt - a.createdAt),
      updateMask: (id, updater) => {
        set((state) => {
          const maskToUpdate = state.masks[id];
          if (!maskToUpdate) return state;
          return {
            masks: { ...state.masks, [id]: updater(maskToUpdate) },
          };
        });
      },
      deleteMask: (id) => {
        set((state) => {
          const newMasks = { ...state.masks };
          delete newMasks[id];
          return { masks: newMasks };
        });
      },
      setDefaultMask: (maskId) => {
        const mask = get().masks[maskId];
        if (mask) {
          set({ defaultMask: mask });
        }
      },
      searchMasks: (query) => {
        const lowerQuery = query.toLowerCase();
        return Object.values(get().masks).filter(mask => 
          mask.name.toLowerCase().includes(lowerQuery) || 
          mask.context.some(prompt => 
            typeof prompt.content === 'string' 
            ? prompt.content.toLowerCase().includes(lowerQuery) 
            : prompt.content.some(p => p.text?.toLowerCase().includes(lowerQuery)))
        );
      },
    }),
    {
      name: StoreKey.Mask,
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: (state) => {
         return (hydratedState, error) => {
          if (error) console.error("Error rehydrating MaskStore:", error);
          if (hydratedState && hydratedState.masks) {
            // Merge built-in masks on hydration if they don't exist, don't overwrite user changes
            const existingMasks = hydratedState.masks;
            const newMasks = { ...existingMasks };
            for (const builtinMask of BUILTIN_MASKS) {
              if (!existingMasks[builtinMask.id]) { // Add if not exists
                newMasks[builtinMask.id] = builtinMask;
              } else { // If exists, ensure builtin flag is correct
                newMasks[builtinMask.id].builtin = true;
              }
            }
            hydratedState.masks = newMasks;
          } else if (hydratedState) {
            hydratedState.masks = BUILTIN_MASKS.reduce((acc, m) => { acc[m.id] = m; return acc; }, {} as Record<string, Mask>);
          }
        };
      },
    }
  )
);

// Initialize with built-in masks if the store is empty after hydration attempt
if (typeof window !== 'undefined') { // Ensure this runs only on client
    const currentMasks = useMaskStore.getState().masks;
    if (Object.keys(currentMasks).length === 0) {
        const initialMasks = BUILTIN_MASKS.reduce((acc, mask) => {
            acc[mask.id] = mask;
            return acc;
        }, {} as Record<string, Mask>);
        useMaskStore.setState({ masks: initialMasks });
    } else {
        // Ensure built-in masks are correctly flagged even if some user masks exist
        const updatedMasks = { ...currentMasks };
        let changed = false;
        for (const builtinMask of BUILTIN_MASKS) {
            if (updatedMasks[builtinMask.id]) {
                if (!updatedMasks[builtinMask.id].builtin) {
                    updatedMasks[builtinMask.id].builtin = true;
                    changed = true;
                }
            } else {
                 updatedMasks[builtinMask.id] = builtinMask;
                 changed = true;
            }
        }
        if (changed) {
            useMaskStore.setState({ masks: updatedMasks });
        }
    }
}
