
import React, { useState } from 'react';
import { useMaskStore } from '../store/useMaskStore';
import { Mask } from '../types';
import { createEmptyMask } from '../utils/masks';
import MaskEditorModal from '../components/masks/MaskEditorModal';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '../components/icons/HeroIcons';

const MasksPage: React.FC = () => {
  const { masks, addMask, updateMask, deleteMask } = useMaskStore();
  const [editingMask, setEditingMask] = useState<Mask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddNewMask = () => {
    setEditingMask(createEmptyMask());
    setIsModalOpen(true);
  };

  const handleEditMask = (mask: Mask) => {
    setEditingMask(mask);
    setIsModalOpen(true);
  };

  const handleDeleteMask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this mask?')) {
      deleteMask(id);
    }
  };

  const handleSaveMask = (mask: Mask) => {
    if (masks[mask.id]) { // Check if ID exists as a key in the Record
      updateMask(mask.id, () => mask);
    } else {
      addMask(mask);
    }
    setIsModalOpen(false);
    setEditingMask(null);
  };
  
  const sortedMasks = Object.values(masks).sort((a,b) => b.createdAt - a.createdAt);

  return (
    <div className="p-6 h-full overflow-y-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Prompt Templates (Masks)</h1>
        <button
          onClick={handleAddNewMask}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Mask
        </button>
      </div>

      {sortedMasks.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No masks created yet. Add one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMasks.map((mask) => (
            <div key={mask.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">{mask.avatar}</span>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 truncate">{mask.name}</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-16 overflow-hidden">
                {mask.context.length > 0 ? mask.context.map(c => typeof c.content === 'string' ? c.content : c.content.map(p => p.text).join('')).join(' ').substring(0, 100) + '...' : 'No context prompts defined.'}
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEditMask(mask)}
                  className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  aria-label="Edit mask"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                {!mask.builtin && (
                   <button
                    onClick={() => handleDeleteMask(mask.id)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    aria-label="Delete mask"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && editingMask && (
        <MaskEditorModal
          mask={editingMask}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMask(null);
          }}
          onSave={handleSaveMask}
        />
      )}
    </div>
  );
};

export default MasksPage;
