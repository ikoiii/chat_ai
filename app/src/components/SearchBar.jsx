import { useState, useEffect } from "react";
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

export default function SearchBar({ onSearch, onSearchResult, messages, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      onSearchResult([]);
      return;
    }

    const results = messages
      .map((msg, index) => {
        const matches = msg.text.toLowerCase().includes(searchQuery.toLowerCase());
        if (matches) {
          const text = msg.text;
          const queryIndex = text.toLowerCase().indexOf(searchQuery.toLowerCase());
          const start = Math.max(0, queryIndex - 50);
          const end = Math.min(text.length, queryIndex + searchQuery.length + 50);
          const excerpt = text.substring(start, end);

          return {
            messageIndex: index,
            message: msg,
            excerpt: (start > 0 ? '...' : '') + excerpt + (end < text.length ? '...' : ''),
            queryIndex: queryIndex - start
          };
        }
        return null;
      })
      .filter(Boolean);

    setSearchResults(results);
    setCurrentResultIndex(0);
    onSearchResult(results);
  }, [searchQuery, messages, onSearchResult]);

  const handlePreviousResult = () => {
    if (searchResults.length > 0) {
      const newIndex = currentResultIndex > 0 ? currentResultIndex - 1 : searchResults.length - 1;
      setCurrentResultIndex(newIndex);
      scrollToMessage(searchResults[newIndex].messageIndex);
    }
  };

  const handleNextResult = () => {
    if (searchResults.length > 0) {
      const newIndex = currentResultIndex < searchResults.length - 1 ? currentResultIndex + 1 : 0;
      setCurrentResultIndex(newIndex);
      scrollToMessage(searchResults[newIndex].messageIndex);
    }
  };

  const scrollToMessage = (messageIndex) => {
    const messageElements = document.querySelectorAll('[data-message-index]');
    const targetElement = messageElements[messageIndex];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add highlight effect
      targetElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
      setTimeout(() => {
        targetElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
      }, 2000);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setCurrentResultIndex(0);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNextResult();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handlePreviousResult();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleNextResult();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 backdrop-blur-lg transition-all duration-300">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsExpanded(true)}
              placeholder="Cari pesan... (Enter untuk navigasi)"
              className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="hidden sm:inline">
                {currentResultIndex + 1} / {searchResults.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePreviousResult}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
                  title="Previous result (↑)"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextResult}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
                  title="Next result (↓)"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Results Preview */}
        {isExpanded && searchResults.length > 0 && (
          <div className="mt-3 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {searchResults.slice(0, 5).map((result, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setCurrentResultIndex(index);
                    scrollToMessage(result.messageIndex);
                    setIsExpanded(false);
                  }}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    index === currentResultIndex
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600'
                  }`}
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {result.message.sender === 'user' ? 'You' : 'AI'} •
                    {new Date(result.message.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {result.excerpt.split('').map((char, idx) => (
                      <span
                        key={idx}
                        className={
                          idx >= result.queryIndex && idx < result.queryIndex + searchQuery.length
                            ? 'bg-yellow-200 dark:bg-yellow-800 font-semibold'
                            : ''
                        }
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {searchResults.length > 5 && (
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
                  ...dan {searchResults.length - 5} hasil lainnya
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}