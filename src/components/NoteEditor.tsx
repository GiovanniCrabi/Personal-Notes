import React from 'react';
import { Edit2, Save, X, ArrowLeft } from 'lucide-react';
import type { Note } from '../types';

interface NoteEditorProps {
  note: Note | null;
  isEditing: boolean;
  editTitle: string;
  editContent: string;
  onEditTitleChange: (title: string) => void;
  onEditContentChange: (content: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onBack?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  isEditing,
  editTitle,
  editContent,
  onEditTitleChange,
  onEditContentChange,
  onStartEdit,
  onSave,
  onCancel,
  onBack
}) => {
  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg">Select a note to view</p>
          <p className="text-sm mt-2">or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-screen md:h-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to notes"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              className="text-xl font-bold text-gray-800 border-b-2 border-purple-500 focus:outline-none px-2 py-1"
              placeholder="Note title"
              autoFocus
            />
          ) : (
            <h2 className="text-xl font-bold text-gray-800">{note.title}</h2>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onSave}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </>
          ) : (
            <button
              onClick={onStartEdit}
              className="cursor-grab  flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            className="w-full h-full min-h-[300px] text-gray-700 focus:outline-none resize-none"
            placeholder="Write your note here..."
          />
        ) : (
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {note.content || 'Empty note'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 text-sm text-gray-500">
        Last updated: {note.updatedAt.toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })}
      </div>
    </div>
  );
};