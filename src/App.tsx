import React, { useState } from 'react';
import { Plus, LogOut, User, Search } from 'lucide-react';
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

  // Deriva a nota selecionada do ID, sempre pegando a versão mais atual
  const selectedNote = selectedNoteId 
    ? notes.find(n => n.id === selectedNoteId) || null
    : null;

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNote = async () => {
    console.log('🔵 Botão New Note clicado');
    console.log('🔵 User ID:', user?.id);
    console.log('🔵 Função addNote existe?', typeof addNote === 'function');
    
    try {
      console.log('🔵 Iniciando criação da nota...');
      const noteId = await addNote('New Note', '');
      console.log('✅ Nota criada com ID:', noteId);
      
      setSelectedNoteId(noteId);
      setIsEditing(true);
      setEditTitle('New Note');
      setEditContent('');
      
      console.log('✅ Estado atualizado');
    } catch (error) {
      console.error('❌ Erro ao criar nota:', error);
      alert(`Erro ao criar nota: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleSelectNote = (note: Note) => {
    console.log('🔵 Nota selecionada:', note.id);
    setSelectedNoteId(note.id);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSaveNote = async () => {
    if (selectedNote) {
      try {
        console.log('🔵 Salvando nota:', selectedNote.id);
        await updateNote(selectedNote.id, editTitle, editContent);
        setIsEditing(false);
        console.log('✅ Nota salva com sucesso');
      } catch (error) {
        console.error('❌ Erro ao salvar nota:', error);
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Minhas Notas</h1>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 truncate">{user.email}</span>
          </div>

          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de Notas */}
        <div className="flex-1 overflow-y-auto p-4">
          {notesLoading ? (
            <div className="text-center text-gray-500 py-8">Updating Notes...</div>
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
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleCreateNote}
            disabled={!addNote || notesLoading}
            className="cursor-grab w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:bg-purple-400 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </div>
      </div>

      {/* Área de Edição */}
      <div className="flex-1 flex flex-col">
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
        />
      </div>
    </div>
  );
};

export default App;