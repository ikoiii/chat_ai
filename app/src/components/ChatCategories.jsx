import { useState } from "react";
import { Folder, FolderOpen, Plus, X, Hash, MessageSquare, Briefcase, User, Star, Archive } from 'lucide-react';

export default function ChatCategories({ activeCategory, onCategoryChange, onCreateCategory }) {
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const defaultCategories = [
    { id: 'all', name: 'All Chats', icon: Hash, count: 0, color: 'text-gray-600 dark:text-gray-400' },
    { id: 'personal', name: 'Personal', icon: User, count: 0, color: 'text-blue-600 dark:text-blue-400' },
    { id: 'work', name: 'Work', icon: Briefcase, count: 0, color: 'text-green-600 dark:text-green-400' },
    { id: 'ai-assistant', name: 'AI Assistant', icon: MessageSquare, count: 0, color: 'text-purple-600 dark:text-purple-400' },
    { id: 'starred', name: 'Starred', icon: Star, count: 0, color: 'text-yellow-600 dark:text-yellow-400' },
    { id: 'archived', name: 'Archived', icon: Archive, count: 0, color: 'text-gray-500 dark:text-gray-500' }
  ];

  const [categories, setCategories] = useState(defaultCategories);

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: `custom-${Date.now()}`,
        name: newCategoryName.trim(),
        icon: Folder,
        count: 0,
        color: 'text-indigo-600 dark:text-indigo-400',
        isCustom: true
      };

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      onCreateCategory?.(newCategory);
      setNewCategoryName("");
      setShowNewCategoryInput(false);
    }
  };

  const handleDeleteCategory = (categoryId, e) => {
    e.stopPropagation();
    if (categoryId.startsWith('custom-')) {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      setCategories(updatedCategories);
      if (activeCategory === categoryId) {
        onCategoryChange?.('all');
      }
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="space-y-1">
        {/* Categories Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Categories
          </h3>
          <button
            onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="New category"
          >
            <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* New Category Input */}
        {showNewCategoryInput && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateCategory();
                } else if (e.key === 'Escape') {
                  setShowNewCategoryInput(false);
                  setNewCategoryName("");
                }
              }}
              placeholder="Category name..."
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-500 dark:placeholder-gray-400"
              autoFocus
            />
            <button
              onClick={handleCreateCategory}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="Create"
            >
              <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
            </button>
            <button
              onClick={() => {
                setShowNewCategoryInput(false);
                setNewCategoryName("");
              }}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        )}

        {/* Category List */}
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange?.(category.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Icon className={`w-4 h-4 ${category.color} flex-shrink-0 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : ''
                  }`} />
                  <span className={`text-sm font-medium truncate ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {category.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {category.count > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isActive
                        ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {category.count}
                    </span>
                  )}

                  {category.isCustom && (
                    <button
                      onClick={(e) => handleDeleteCategory(category.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                      title="Delete category"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Total Messages</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {categories.filter(cat => cat.isCustom).length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Custom Categories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}