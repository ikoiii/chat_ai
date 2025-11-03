import { useState, useRef, useEffect } from "react";
import { Send, Mic, Paperclip } from "lucide-react";

export default function ChatInput({ onSend, loading, inputRef: externalInputRef }) {
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const internalInputRef = useRef(null);
  const textareaRef = externalInputRef || internalInputRef;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading || isComposing) return;

    onSend(input);
    setInput("");

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter for new line
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      setInput(prev => prev + '\n');
    }
  };

  const characterCount = input.length;
  const maxCharacters = 2000;

  return (
    <footer className="border-t border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/70 backdrop-blur-lg p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-end gap-1.5 sm:gap-2">
          <button
            type="button"
            className="hidden sm:block p-3 rounded-xl bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            title="Lampirkan file (segera)"
            disabled
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              className="w-full resize-none bg-gray-100 dark:bg-slate-700/50 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 pr-12 sm:pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 text-sm sm:text-base"
              rows="1"
              placeholder="Ketik pesanmu... (Enter kirim, Shift+Enter baru)"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, maxCharacters))}
              onKeyDown={handleKeyDown}
              onKeyPress={handleKeyPress}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              disabled={loading}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            {characterCount > maxCharacters * 0.8 && (
              <div className={`absolute bottom-1 right-1 text-xs px-1 rounded ${
                characterCount >= maxCharacters
                  ? 'text-red-400 bg-red-900/20'
                  : 'text-yellow-400 bg-yellow-900/20'
              }`}>
                {characterCount}/{maxCharacters}
              </div>
            )}
          </div>

          <button
            type="button"
            className="hidden sm:block p-3 rounded-xl bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            title="Input suara (segera)"
            disabled
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={loading || !input.trim() || isComposing}
            className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all transform hover:scale-105 active:scale-95 ${
              loading || !input.trim()
                ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl'
            }`}
          >
            <Send className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>AI sedang berpikir...</span>
          </div>
        )}
      </form>
    </footer>
  );
}
