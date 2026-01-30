import React from 'react';
import { 
  Trash2, 
  FileText, 
  CheckSquare, 
  ShoppingCart, 
  List, 
  Lightbulb, 
  Target,
  ChevronRight 
} from 'lucide-react';
import type { Group } from '../types';

interface GroupsListProps {
  groups: Group[];
  selectedGroup: Group | null;
  onSelectGroup: (group: Group) => void;
  onDeleteGroup: (id: string) => void;
  searchTerm: string;
}

const iconComponents = {
  note: FileText,
  todo: CheckSquare,
  shopping: ShoppingCart,
  checklist: List,
  ideas: Lightbulb,
  goals: Target,
};

const typeColors = {
  note: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    text: 'text-blue-600',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  },
  todo: {
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
    text: 'text-purple-600',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
  },
  shopping: {
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    text: 'text-green-600',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
  },
  checklist: {
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
    text: 'text-orange-600',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
  },
  ideas: {
    gradient: 'from-yellow-500 to-orange-500',
    bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    text: 'text-yellow-600',
    iconBg: 'bg-gradient-to-br from-yellow-500 to-orange-500',
  },
  goals: {
    gradient: 'from-red-500 to-rose-500',
    bg: 'bg-gradient-to-br from-red-50 to-rose-50',
    text: 'text-red-600',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-500',
  },
};

export const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  selectedGroup,
  onSelectGroup,
  onDeleteGroup,
  searchTerm,
}) => {
  if (groups.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <div className="glass-dark rounded-2xl p-8 mx-auto max-w-sm">
          <p className="text-sm font-medium">
            {searchTerm ? 'No groups found' : 'No groups yet'}
          </p>
          {!searchTerm && (
            <p className="text-xs mt-2 opacity-75">Create your first group to get started</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const IconComponent = iconComponents[group.type];
        const colors = typeColors[group.type];
        const isSelected = selectedGroup?.id === group.id;

        return (
          <div
            key={group.id}
            onClick={() => onSelectGroup(group)}
            className={`
              relative overflow-hidden
              p-4 rounded-xl cursor-pointer transition-smooth card-hover
              ${colors.bg}
              ${isSelected 
                ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.02]' 
                : 'hover:shadow-md'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${colors.iconBg} shrink-0 shadow-sm`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-gray-800 truncate">
                  {group.title}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5 font-medium">
                  {group.updatedAt.toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this group and all its notes?')) {
                      onDeleteGroup(group.id);
                    }
                  }}
                  className="p-2 hover:bg-red-100 active:bg-red-200 rounded-lg transition-smooth"
                  title="Delete group"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
                <ChevronRight className={`w-5 h-5 ${colors.text}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
