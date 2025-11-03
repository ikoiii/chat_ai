import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Zap, MessageCircle, HelpCircle, Trash2, Search, X, Menu, Palette } from 'lucide-react';

export default function Header({ onClearChat, onShowHelp, messageCount, onToggleSearch, showSearch, onToggleSidebar, onShowThemeCustomizer }) {
  const { theme, toggleTheme, primaryColor } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="relative text-center py-4 bg-white/90 dark:bg-slate-800/90 shadow-lg backdrop-blur-md border-b border-gray-200 dark:border-slate-700 transition-all duration-300">
      {/* Right side controls */}
      <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {/* Theme Customizer Button */}
        <button
          onClick={onShowThemeCustomizer}
          className="hidden sm:block p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300 transform hover:scale-110 active:scale-95"
          title="Customize theme"
        >
          <Palette className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: primaryColor }} />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300 transform hover:scale-110 active:scale-95"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 absolute -bottom-1 -right-1" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            AI Chat
          </h1>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Powered by <span className="font-medium">FastAPI</span> + <span className="font-medium">React</span>
      </p>

      {/* Left side controls */}
      <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
          title="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          {isDark ? (
            <>
              <Moon className="w-3 h-3" />
              <span className="hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3 h-3" />
              <span className="hidden sm:inline">Light</span>
            </>
          )}
        </div>

        <div className="w-px h-4 bg-gray-300 dark:bg-slate-600 hidden sm:block"></div>

        <button
          onClick={onToggleSearch}
          className={`hidden sm:block p-1.5 rounded-lg transition-all ${
            showSearch
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
          }`}
          title="Search messages (Ctrl+F)"
        >
          {showSearch ? <X className="w-3 h-3 sm:w-4 sm:h-4" /> : <Search className="w-3 h-3 sm:w-4 sm:h-4" />}
        </button>

        <button
          onClick={onShowHelp}
          className="hidden sm:block p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
          title="Keyboard shortcuts (Ctrl+H)"
        >
          <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>

        <button
          onClick={onClearChat}
          className="hidden sm:block p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          title="Clear chat (Ctrl+K)"
          disabled={messageCount <= 1}
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </header>
  );
}
