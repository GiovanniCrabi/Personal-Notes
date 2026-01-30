import React, { useState } from 'react';
import { Plus, LogOut, User, Search, Menu, X } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useNotes } from './hooks/useNotes';
import { AuthForm } from './components/AuthForm';
import { NotesList } from './components/NotesList';
import { NoteEditor } from './components/NoteEditor';
import type { Note } from './types';

const App: React.FC = () => {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { notes, loading: notesLoading, addNote, updateNote, deleteNote } = useNotes(user?.id || null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const selectedNote = selectedNoteId 
    ? notes.find(n => n.id === selectedNoteId) || null
    : null;

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNote = async () => {

    
    try {
      const noteId = await addNote('New Note', '');
      
      setSelectedNoteId(noteId);
      setIsEditing(true);
      setEditTitle('New Note');
      setEditContent('');
      
    } catch (error) {
      alert(`Erro ao criar nota: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsSidebarOpen(false);
  };

  const handleSaveNote = async () => {
    if (selectedNote) {
      try {
        await updateNote(selectedNote.id, editTitle, editContent);
        setIsEditing(false);
      } catch (error) {
        console.error(' Erro ao salvar nota:', error);
        alert('Erro ao salvar nota. Tente novamente.');
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error('❌ Erro ao excluir nota:', error);
      alert('Erro ao excluir nota. Tente novamente.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setSelectedNoteId(null);
      setSearchTerm('');
    } catch (error) {
      console.error('❌ Erro ao sair:', error);
      alert('Erro ao sair. Tente novamente.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Wait a minute...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Overlay para mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-full sm:w-80 lg:w-80
          bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">Minhas Notas</h1>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3 px-1">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-2 sm:top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de Notas */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {notesLoading ? (
            <div className="text-center text-gray-500 py-8 text-sm sm:text-base">Updating Notes...</div>
          ) : (
            <NotesList
              notes={filteredNotes}
              selectedNote={selectedNote}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
              searchTerm={searchTerm}
            />
          )}
        </div>

        {/* Botão New Note */}
        <div className="p-3 sm:p-4 border-t border-gray-200">
          <button
            onClick={handleCreateNote}
            disabled={!addNote || notesLoading}
            className="w-full bg-purple-600 text-white py-2 sm:py-2.5 rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors flex items-center justify-center gap-2 font-medium disabled:bg-purple-400 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            New Note
          </button>
        </div>
      </div>

      {/* Área de Edição */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Botão Menu Mobile */}
        {!selectedNote && (
          <div className="lg:hidden p-4 border-b border-gray-200 bg-white">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 text-gray-700 font-medium"
            >
              <Menu className="w-5 h-5" />
              <span>Menu</span>
            </button>
          </div>
        )}

        <NoteEditor
          note={selectedNote}
          isEditing={isEditing}
          editTitle={editTitle}
          editContent={editContent}
          onEditTitleChange={setEditTitle}
          onEditContentChange={setEditContent}
          onStartEdit={() => setIsEditing(true)}
          onSave={handleSaveNote}
          onCancel={handleCancelEdit}
          onBack={() => {
            setSelectedNoteId(null);
            setIsSidebarOpen(true);
          }}
        />
      </div>
    </div>
  );
};

export default App;