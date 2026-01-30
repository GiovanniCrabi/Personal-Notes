import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Note } from '../types';

interface NotesListProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  searchTerm: string;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  selectedNote,
  onSelectNote,
  onDeleteNote,
  searchTerm
}) => {
  if (notes.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <div className="glass-dark rounded-2xl p-8 mx-auto max-w-sm">
          <p className="text-sm font-medium">
            {searchTerm ? 'No notes found' : 'No notes yet'}
          </p>
          {!searchTerm && (
            <p className="text-xs mt-2 opacity-75">Click "New Note" to create one</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map(note => (
        <div
          key={note.id}
          onClick={() => onSelectNote(note)}
          className={`
            relative overflow-hidden
            p-4 rounded-xl cursor-pointer transition-smooth card-hover
            bg-gradient-to-br from-white to-gray-50
            ${selectedNote?.id === note.id
              ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.02]'
              : 'hover:shadow-md'
            }
          `}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-gray-800 truncate">{note.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1.5 break-words">
                {note.content || 'Empty note'}
              </p>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                {note.updatedAt.toLocaleDateString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Do you really want to delete this note?')) {
                  onDeleteNote(note.id);
                }
              }}
              className="p-2 hover:bg-red-100 active:bg-red-200 rounded-lg transition-smooth shrink-0"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};