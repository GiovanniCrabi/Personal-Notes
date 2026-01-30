import React, { useState } from 'react';
import { 
  FileText, 
  CheckSquare, 
  ShoppingCart, 
  List, 
  Lightbulb, 
  Target,
  ChevronRight 
} from 'lucide-react';
import { Dialog } from './Dialog';
import type { GroupType, CategoryOption } from '../types';

interface CreateNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, type: GroupType) => Promise<void>;
}

const categoryOptions: CategoryOption[] = [
  {
    id: 'note',
    label: 'Simple Note',
    description: 'Free text note for general use',
    icon: 'FileText',
    color: 'text-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'todo',
    label: 'To-Do List',
    description: 'Task list with checkboxes',
    icon: 'CheckSquare',
    color: 'text-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'shopping',
    label: 'Shopping List',
    description: 'List of items to buy',
    icon: 'ShoppingCart',
    color: 'text-green-600',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'checklist',
    label: 'Checklist',
    description: 'Generic checklist for any purpose',
    icon: 'List',
    color: 'text-orange-600',
    bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'ideas',
    label: 'Ideas & Brainstorm',
    description: 'Capture creative ideas and thoughts',
    icon: 'Lightbulb',
    color: 'text-yellow-600',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    borderColor: 'border-yellow-200',
  },
  {
    id: 'goals',
    label: 'Goals & Objectives',
    description: 'Track your goals and milestones',
    icon: 'Target',
    color: 'text-red-600',
    bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
    borderColor: 'border-red-200',
  },
];

const iconComponents = {
  FileText,
  CheckSquare,
  ShoppingCart,
  List,
  Lightbulb,
  Target,
};

export const CreateNoteDialog: React.FC<CreateNoteDialogProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [step, setStep] = useState<'category' | 'details'>('category');
  const [selectedCategory, setSelectedCategory] = useState<GroupType | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCategorySelect = (category: GroupType) => {
    setSelectedCategory(category);
    setStep('details');
  };

  const handleBack = () => {
    setStep('category');
    setSelectedCategory(null);
  };

  const handleCreate = async () => {
    if (!title.trim() || !selectedCategory) return;

    setLoading(true);
    try {
      await onCreate(title.trim(), selectedCategory);
      handleClose();
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('category');
    setSelectedCategory(null);
    setTitle('');
    setLoading(false);
    onClose();
  };

  const selectedCategoryOption = categoryOptions.find(
    (opt) => opt.id === selectedCategory
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'category' ? 'Choose Group Type' : 'Create Group'}
      maxWidth="lg"
    >
      {step === 'category' ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-700 font-medium">
            Select the type of group you want to create
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryOptions.map((option) => {
              const IconComponent = iconComponents[option.icon as keyof typeof iconComponents];
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleCategorySelect(option.id)}
                  className={`
                    flex items-start gap-3 p-5 rounded-2xl border-2 transition-smooth card-hover
                    ${option.bgColor} ${option.borderColor}
                    hover:border-opacity-100 border-opacity-50 hover:shadow-lg
                  `}
                >
                  <div className={`p-2.5 rounded-xl bg-white shadow-sm shrink-0`}>
                    <IconComponent className={`w-6 h-6 ${option.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-gray-800 text-base">
                      {option.label}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 self-center" />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedCategoryOption && (
            <div
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2
                ${selectedCategoryOption.bgColor} ${selectedCategoryOption.borderColor}
              `}
            >
              {(() => {
                const IconComponent = iconComponents[selectedCategoryOption.icon as keyof typeof iconComponents];
                return <IconComponent className={`w-5 h-5 ${selectedCategoryOption.color}`} />;
              })()}
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">
                  {selectedCategoryOption.label}
                </p>
              </div>
              <button
                onClick={handleBack}
                className="text-xs text-gray-600 hover:text-gray-800 underline"
              >
                Change
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter ${selectedCategoryOption?.label.toLowerCase()} title...`}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              {selectedCategory === 'note' && (
                <>This group will contain simple text notes.</>
              )}
              {(selectedCategory === 'todo' || 
                selectedCategory === 'shopping' || 
                selectedCategory === 'checklist') && (
                <>This group will contain lists with checkable items.</>
              )}
              {selectedCategory === 'ideas' && (
                <>Perfect for organizing brainstorming sessions and creative thoughts.</>
              )}
              {selectedCategory === 'goals' && (
                <>Organize and track your goals and milestones.</>
              )}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex-1 px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 active:scale-95 transition-smooth font-semibold disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={!title.trim() || loading}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-smooth font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
};
