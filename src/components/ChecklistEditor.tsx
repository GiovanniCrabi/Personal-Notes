import React, { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import type { NoteItem } from '../types';

interface ChecklistEditorProps {
  items: NoteItem[];
  onItemsChange: (items: NoteItem[]) => void;
  readOnly?: boolean;
}

export const ChecklistEditor: React.FC<ChecklistEditorProps> = ({
  items,
  onItemsChange,
  readOnly = false,
}) => {
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newItem: NoteItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false,
      createdAt: new Date(),
    };

    onItemsChange([...items, newItem]);
    setNewItemText('');
  };

  const handleToggleItem = (itemId: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onItemsChange(updatedItems);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    onItemsChange(updatedItems);
  };

  const handleUpdateItemText = (itemId: string, newText: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, text: newText } : item
    );
    onItemsChange(updatedItems);
  };

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      {totalCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-800">
              {completedCount} / {totalCount}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.length === 0 && readOnly && (
          <div className="text-center text-gray-400 py-8 text-sm">
            No items yet
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className={`
              flex items-start gap-3 p-3 rounded-lg border-2 transition-all
              ${item.completed 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-white border-gray-300'
              }
            `}
          >
            <button
              onClick={() => handleToggleItem(item.id)}
              disabled={readOnly}
              className={`
                shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                ${item.completed
                  ? 'bg-purple-600 border-purple-600'
                  : 'bg-white border-gray-300 hover:border-purple-400'
                }
                ${readOnly ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              {item.completed && <Check className="w-3 h-3 text-white" />}
            </button>

            <input
              type="text"
              value={item.text}
              onChange={(e) => handleUpdateItemText(item.id, e.target.value)}
              disabled={readOnly}
              className={`
                flex-1 bg-transparent border-none focus:outline-none text-sm sm:text-base
                ${item.completed 
                  ? 'line-through text-gray-400' 
                  : 'text-gray-800'
                }
                ${readOnly ? 'cursor-default' : ''}
              `}
            />

            {!readOnly && (
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="shrink-0 p-1 hover:bg-red-100 rounded transition-colors"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddItem();
              }
            }}
            placeholder="Add new item..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
          />
          <button
            onClick={handleAddItem}
            disabled={!newItemText.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      )}
    </div>
  );
};
