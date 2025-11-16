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
      <div className="text-center text-gray-500 py-8">
        {searchTerm ? 'No notes found' : 'No notes yet'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map(note => (
        <div
          key={note.id}
          onClick={() => onSelectNote(note)}
          className={`p-3 rounded-lg cursor-pointer transition-colors ${
            selectedNote?.id === note.id
              ? 'bg-purple-50 border-2 border-purple-500'
              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 truncate">{note.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {note.content || 'Empty note'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
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
              className="ml-2 p-1.5 hover:bg-red-100 rounded transition-colors shrink-0"
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