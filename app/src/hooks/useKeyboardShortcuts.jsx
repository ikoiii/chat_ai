import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const useKeyboardShortcuts = ({
  onClearChat,
  onSendMessage,
  inputRef,
  messages
}) => {
  const { toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in input
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        return;
      }

      // Ctrl/Cmd + K: Clear chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClearChat?.();
      }

      // Ctrl/Cmd + T: Toggle theme
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleTheme();
      }

      // Ctrl/Cmd + /: Focus input
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        inputRef?.current?.focus();
      }

      // Escape: Unfocus input
      if (e.key === 'Escape') {
        e.preventDefault();
        inputRef?.current?.blur();
      }

      // Ctrl/Cmd + Enter: Send message (if input is focused)
      if (e.target === inputRef?.current && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const inputValue = inputRef.current.value.trim();
        if (inputValue) {
          onSendMessage?.(inputValue);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClearChat, onSendMessage, inputRef, toggleTheme]);

  // Help modal shortcuts
  const showHelp = () => {
    alert(`
      Help:
      Tidak ada informasi bantuan saat ini.
    `);
  };

  return { showHelp };
};