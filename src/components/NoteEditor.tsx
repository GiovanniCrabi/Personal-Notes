import React from 'react';
import { Edit2, Save, X, ArrowLeft } from 'lucide-react';
import { ChecklistEditor } from './ChecklistEditor';
import type { Note, NoteItem, GroupType } from '../types';

interface NoteEditorProps {
  note: Note | null;
  groupType?: GroupType;
  isEditing: boolean;
  editTitle: string;
  editContent: string;
  editItems: NoteItem[];
  onEditTitleChange: (title: string) => void;
  onEditContentChange: (content: string) => void;
  onEditItemsChange: (items: NoteItem[]) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onBack?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  groupType,
  isEditing,
  editTitle,
  editContent,
  editItems,
  onEditTitleChange,
  onEditContentChange,
  onEditItemsChange,
  onStartEdit,
  onSave,
  onCancel,
  onBack
}) => {
  const isChecklistType = groupType === 'todo' || groupType === 'shopping' || groupType === 'checklist';

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="glass-dark rounded-3xl p-12 max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Edit2 className="w-10 h-10 text-white" />
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-2">Select a note to view</p>
            <p className="text-sm text-gray-600">or create a new one to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen lg:h-auto">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="lg:hidden p-2 hover:bg-white/20 rounded-xl transition-smooth backdrop-blur-sm shrink-0"
                title="Back to notes"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => onEditTitleChange(e.target.value)}
                className="text-lg sm:text-2xl font-bold bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 px-4 py-2 w-full min-w-0 placeholder-white/60"
                placeholder="Title"
                autoFocus
              />
            ) : (
              <h2 className="text-lg sm:text-2xl font-bold truncate">{note.title}</h2>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditing ? (
              <>
                <button
                  onClick={onCancel}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-smooth backdrop-blur-sm"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={onSave}
                  className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-smooth font-semibold shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </>
            ) : (
              <button
                onClick={onStartEdit}
                className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-smooth font-semibold shadow-lg"
              >
                <Edit2 className="w-5 h-5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white/50">
        {isChecklistType ? (
          <div className="max-w-3xl mx-auto">
            <ChecklistEditor
              items={isEditing ? editItems : (note.items || [])}
              onItemsChange={onEditItemsChange}
              readOnly={!isEditing}
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => onEditContentChange(e.target.value)}
                className="w-full h-full min-h-[400px] sm:min-h-[500px] text-base sm:text-lg text-gray-700 focus:outline-none resize-none bg-transparent leading-relaxed"
                placeholder="Write your note here..."
              />
            ) : (
              <div className="prose prose-base sm:prose-lg max-w-none">
                <p className="text-base sm:text-lg text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                  {note.content || 'Empty note'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200/50 bg-white/50 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            Last updated: {note.updatedAt.toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};