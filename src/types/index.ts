export type GroupType = 
  | 'note'          // Nota simples
  | 'todo'          // Lista de tarefas
  | 'shopping'      // Lista de compras
  | 'checklist'     // Checklist genérico
  | 'ideas'         // Ideias/Brainstorm
  | 'goals';        // Metas/Objetivos

export interface NoteItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

// Grupo/Categoria que contém notas
export interface Group {
  id: string;
  title: string;
  type: GroupType;
  userId: string;
  createdBy: string;      // Email do usuário que criou
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  deletedAt?: Date;
}

// Nota que pertence a um grupo
export interface Note {
  id: string;
  groupId: string;        // Referência ao grupo
  title: string;
  content: string;
  items?: NoteItem[];     // Para listas (todo, shopping, checklist)
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  deletedAt?: Date;
}

export interface User {
  id: string;
  email: string;
}

export interface CategoryOption {
  id: GroupType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}