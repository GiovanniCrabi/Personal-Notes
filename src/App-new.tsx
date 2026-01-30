import React, { useState } from 'react';
import { Plus, LogOut, User, Search, Menu, X } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useGroups } from './hooks/useGroups';
import { useNotes } from './hooks/useNotes';
import { AuthForm } from './components/AuthForm';
import { GroupsList } from './components/GroupsList';
import { NotesList } from './components/NotesList';
import { NoteEditor } from './components/NoteEditor';
import { CreateNoteDialog } from './components/CreateNoteDialog';
import type { Group, Note, GroupType, NoteItem } from './types';

const App: React.FC = () => {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { groups, loading: groupsLoading, addGroup, deleteGroup } = useGroups(user?.id || null, user?.email || null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editItems, setEditItems] = useState<NoteItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { notes, loading: notesLoading, addNote, updateNote, deleteNote } = useNotes(
    user?.id || null, 
    selectedGroupId
  );

  const selectedGroup = selectedGroupId 
    ? groups.find(g => g.id === selectedGroupId) || null
    : null;

  const selectedNote = selectedNoteId 
    ? notes.find(n => n.id === selectedNoteId) || null
    : null;

  const filteredGroups = groups.filter(group =>
    group.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = async (title: string, type: GroupType) => {
    try {
      const groupId = await addGroup(title, type);
      setSelectedGroupId(groupId);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating group:', error);
      alert(`Error creating group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSelectGroup = (group: Group) => {
    setSelectedGroupId(group.id);
    setSelectedNoteId(null);
    setIsSidebarOpen(false);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditItems(note.items || []);
    setIsSidebarOpen(false);
  };

  const handleCreateNote = async () => {
    if (!selectedGroupId) {
      alert('Please select a group first');
      return;
    }

    try {
      const isChecklistType = selectedGroup?.type === 'todo' || 
                             selectedGroup?.type === 'shopping' || 
                             selectedGroup?.type === 'checklist';
      
      const noteId = await addNote('New Note', '', isChecklistType ? [] : undefined);
      setSelectedNoteId(noteId);
      setIsEditing(true);
      setEditTitle('New Note');
      setEditContent('');
      setEditItems([]);
    } catch (error) {
      console.error('Error creating note:', error);
      alert(`Error creating note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteGroup(id);
      if (selectedGroupId === id) {
        setSelectedGroupId(null);
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Error deleting group. Please try again.');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note. Please try again.');
    }
  };

  const handleSaveNote = async () => {
    if (selectedNote) {
      try {
        const isChecklistType = selectedGroup?.type === 'todo' || 
                               selectedGroup?.type === 'shopping' || 
                               selectedGroup?.type === 'checklist';
        
        await updateNote(
          selectedNote.id, 
          editTitle, 
          editContent,
          isChecklistType ? editItems : undefined
        );
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving note:', error);
        alert('Error saving note. Please try again.');
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
      setEditItems(selectedNote.items || []);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setSelectedGroupId(null);
      setSelectedNoteId(null);
      setSearchTerm('');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex relative p-2 sm:p-4 gap-2 sm:gap-4">
      {!user ? (
        <AuthForm onSignIn={signIn} onSignUp={signUp} />
      ) : (
        <>
          <CreateNoteDialog
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            onCreate={handleCreateGroup}
          />

          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <div
            className={`
              fixed lg:relative inset-y-0 left-0 z-50
              w-full sm:w-80 lg:w-80
              glass rounded-2xl shadow-2xl flex flex-col overflow-hidden
              transform transition-all duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0 m-2 sm:m-4 lg:m-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">My Notes</h1>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSignOut}
                    className="p-2 hover:bg-white/20 rounded-xl transition-smooth backdrop-blur-sm"
                    title="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden p-2 hover:bg-white/20 rounded-xl transition-smooth backdrop-blur-sm"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 px-1">
                <User className="w-4 h-4 shrink-0 opacity-90" />
                <span className="text-sm opacity-90 truncate">{user.email}</span>
              </div>

              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-white/60" />
                <input
                  type="text"
                  placeholder={selectedGroupId ? "Search notes..." : "Search groups..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-smooth"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!selectedGroupId ? (
                groupsLoading ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <p className="text-sm">Loading groups...</p>
                  </div>
                ) : (
                  <GroupsList
                    groups={filteredGroups}
                    selectedGroup={selectedGroup}
                    onSelectGroup={handleSelectGroup}
                    onDeleteGroup={handleDeleteGroup}
                    searchTerm={searchTerm}
                  />
                )
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSelectedGroupId(null);
                      setSelectedNoteId(null);
                      setSearchTerm('');
                    }}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 mb-3 font-medium transition-smooth px-2 py-1 hover:bg-indigo-50 rounded-lg"
                  >
                    ← Back to groups
                  </button>
                  
                  {selectedGroup && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm">
                      <p className="text-xs text-indigo-600 font-medium mb-1">Current group</p>
                      <p className="font-semibold text-gray-800">{selectedGroup.title}</p>
                    </div>
                  )}

                  {notesLoading ? (
                    <div className="text-center text-gray-500 py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                      <p className="text-sm">Loading notes...</p>
                    </div>
                  ) : (
                    <NotesList
                      notes={filteredNotes}
                      selectedNote={selectedNote}
                      onSelectNote={handleSelectNote}
                      onDeleteNote={handleDeleteNote}
                      searchTerm={searchTerm}
                    />
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-200/50 bg-white/50">
              {!selectedGroupId ? (
                <button
                  onClick={() => setIsCreateDialogOpen(true)}
                  disabled={groupsLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-smooth flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  New Group
                </button>
              ) : (
                <button
                  onClick={handleCreateNote}
                  disabled={notesLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-smooth flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  New Note
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col w-full lg:w-auto glass rounded-2xl shadow-2xl overflow-hidden">
            {!selectedNote && (
              <div className="lg:hidden p-4 border-b border-gray-200/50 bg-white/50">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-2 text-gray-700 font-medium hover:text-indigo-600 transition-smooth"
                >
                  <Menu className="w-5 h-5" />
                  <span>Menu</span>
                </button>
              </div>
            )}

            <NoteEditor
              note={selectedNote}
              groupType={selectedGroup?.type}
              isEditing={isEditing}
              editTitle={editTitle}
              editContent={editContent}
              editItems={editItems}
              onEditTitleChange={setEditTitle}
              onEditContentChange={setEditContent}
              onEditItemsChange={setEditItems}
              onStartEdit={() => setIsEditing(true)}
              onSave={handleSaveNote}
              onCancel={handleCancelEdit}
              onBack={() => {
                setSelectedNoteId(null);
                setIsSidebarOpen(true);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default App;
