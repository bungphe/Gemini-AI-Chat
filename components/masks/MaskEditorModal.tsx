
import React, { useState, useEffect } from 'react';
import { Mask, ChatMessage, Role } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { PlusIcon, TrashIcon } from '../icons/HeroIcons';
import { Select, SelectOption } from '../common/Select';
import { GEMINI_TEXT_MODEL } from '../../constants';

interface MaskEditorModalProps {
  mask: Mask | null;
  onClose: () => void;
  onSave: (mask: Mask) => void;
}

const roleOptions: SelectOption[] = [
  { value: 'system', label: 'System' },
  { value: 'user', label: 'User' },
  { value: 'assistant', label: 'Assistant' },
];

const MaskEditorModal: React.FC<MaskEditorModalProps> = ({ mask, onClose, onSave }) => {
  const [editedMask, setEditedMask] = useState<Mask | null>(null);

  useEffect(() => {
    if (mask) {
      setEditedMask(JSON.parse(JSON.stringify(mask))); // Deep clone
    }
  }, [mask]);

  if (!editedMask) return null;

  const handleInputChange = <K extends keyof Mask>(field: K, value: Mask[K]) => {
    setEditedMask(prev => prev ? { ...prev, [field]: value } : null);
  };
  
  const handleContextChange = (index: number, field: keyof ChatMessage, value: string) => {
    if (!editedMask) return;
    const newContext = [...editedMask.context];
    const messageToUpdate = { ...newContext[index] };
    
    if (field === 'role') {
        messageToUpdate.role = value as Role;
    } else if (field === 'content') {
         // Assuming content is always string for system/context prompts
        messageToUpdate.content = value;
    }

    newContext[index] = messageToUpdate;
    setEditedMask(prev => prev ? { ...prev, context: newContext } : null);
  };

  const addContextPrompt = () => {
    if (!editedMask) return;
    const newPrompt: ChatMessage = {
      id: Date.now().toString(), // Simple ID generation
      role: 'system',
      content: '',
      date: new Date().toISOString(),
    };
    setEditedMask(prev => prev ? { ...prev, context: [...prev.context, newPrompt] } : null);
  };

  const removeContextPrompt = (index: number) => {
    if (!editedMask) return;
    const newContext = editedMask.context.filter((_, i) => i !== index);
    setEditedMask(prev => prev ? { ...prev, context: newContext } : null);
  };

  const handleSave = () => {
    if (editedMask) {
      // Ensure modelConfig is present
      const finalMask = {
        ...editedMask,
        modelConfig: editedMask.modelConfig || { model: GEMINI_TEXT_MODEL, temperature: 0.7 } // Default if not set
      };
      onSave(finalMask);
    }
  };

  return (
    <Modal title={editedMask.id ? 'Edit Mask' : 'Create New Mask'} onClose={onClose}>
      <div className="space-y-4 p-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <Input
            type="text"
            value={editedMask.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar (Emoji)</label>
          <Input
            type="text"
            value={editedMask.avatar}
            onChange={(e) => handleInputChange('avatar', e.target.value)}
            className="mt-1"
            maxLength={2}
          />
        </div>
        
        <h3 className="text-md font-semibold pt-2 text-gray-700 dark:text-gray-300">Context Prompts</h3>
        {editedMask.context.map((prompt, index) => (
          <div key={index} className="p-3 border rounded-md dark:border-gray-600 space-y-2 bg-gray-50 dark:bg-gray-700/50">
            <Select
              options={roleOptions}
              value={prompt.role}
              onChange={(e) => handleContextChange(index, 'role', e.target.value)}
            />
            <textarea
              value={typeof prompt.content === 'string' ? prompt.content : ''} // Handle if content is not string (though context usually is)
              onChange={(e) => handleContextChange(index, 'content', e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-500 rounded-md dark:bg-gray-600 dark:text-gray-100"
              placeholder="Prompt content..."
            />
            <Button onClick={() => removeContextPrompt(index)} variant="danger" size="sm" className="flex items-center">
              <TrashIcon className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        ))}
        <Button onClick={addContextPrompt} variant="secondary" className="flex items-center">
          <PlusIcon className="h-5 w-5 mr-1" /> Add Context Prompt
        </Button>

        <div className="flex justify-end space-x-3 pt-4">
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button onClick={handleSave}>Save Mask</Button>
        </div>
      </div>
    </Modal>
  );
};

export default MaskEditorModal;
