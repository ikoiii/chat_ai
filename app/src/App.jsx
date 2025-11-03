import React, { useState, useRef, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import ChatBox from "./components/ChatBox";
import ChatInput from "./components/ChatInput";
import SearchBar from "./components/SearchBar";
import ChatCategories from "./components/ChatCategories";
import ThemeCustomizer from "./components/ThemeCustomizer";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  // Load messages from localStorage on initial render
  const loadMessages = () => {
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        return JSON.parse(savedMessages);
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
    }

    // Default welcome message
    return [
      {
        text: "Hai! 👋 Aku ikoi, asisten AI-mu hari ini.\n\nAda yang bisa aku bantu?",
        sender: "ai",
        timestamp: new Date().toISOString()
      },
    ];
  };

  const [messages, setMessages] = useState(loadMessages);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [messageReactions, setMessageReactions] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [chatCategories, setChatCategories] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }, [messages]);

  // Send message function
  const handleSend = async (messageText, options = {}) => {
    const userMessage = {
      text: messageText,
      sender: "user",
      timestamp: new Date().toISOString(),
      ...options
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageText }),
      });

      if (!res.ok) {
        // Handle different HTTP status codes
        if (res.status === 429) {
          throw new Error("⏰ Terlalu banyak permintaan. Coba lagi dalam beberapa saat ya!");
        } else if (res.status >= 500) {
          throw new Error("🔥 Server sedang bermasalah. Tim kami sedang memperbaikinya!");
        } else if (res.status === 400) {
          throw new Error("❌ Format pesan tidak valid. Coba periksa kembali pesanmu ya!");
        } else {
          throw new Error("⚠️ Ada masalah koneksi. Coba lagi ya!");
        }
      }

      const data = await res.json();

      if (!data || !data.reply) {
        throw new Error("🤖 Respons dari AI tidak lengkap. Coba tanyakan dengan cara lain!");
      }

      // Check if response is too short or indicates an error
      if (data.reply.length < 10) {
        setMessages((prev) => [
          ...prev,
          {
            text: "🤔 Hmm, aku kurang mengerti. Bisa coba jelaskan dengan lebih detail atau cara berbeda?",
            sender: "ai",
            timestamp: new Date().toISOString()
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text: data.reply,
            sender: "ai",
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error("Chat API Error:", error);

      let errorMessage = "❌ Ada yang salah nih. Coba lagi ya!";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "🌐 Tidak bisa terhubung ke internet. Cek koneksi kamu ya!";
      } else if (error.name === 'AbortError') {
        errorMessage = "⏱️ Waktu habis. Server terlalu lama merespons!";
      }

      setMessages((prev) => [
        ...prev,
        {
          text: errorMessage,
          sender: "ai",
          isError: true,
          timestamp: new Date().toISOString()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Clear chat function
  const handleClearChat = () => {
    const confirmClear = window.confirm('Apakah kamu yakin ingin menghapus semua pesan?');
    if (confirmClear) {
      // Clear localStorage completely
      localStorage.removeItem('chatMessages');
      localStorage.removeItem('messageReactions');
      const newMessages = [
        {
          text: "Ada yang bisa aku bantu?",
          sender: "ai",
          timestamp: new Date().toISOString()
        },
      ];
      setMessages(newMessages);
      setMessageReactions({});
    }
  };

  // Add reaction function
  const handleAddReaction = (messageId, emoji) => {
    setMessageReactions(prev => {
      const reactions = { ...prev };
      if (!reactions[messageId]) {
        reactions[messageId] = [];
      }

      const existingReaction = reactions[messageId].find(r => r.emoji === emoji);
      if (existingReaction) {
        existingReaction.count += 1;
      } else {
        reactions[messageId].push({ emoji, count: 1 });
      }

      // Save to localStorage
      localStorage.setItem('messageReactions', JSON.stringify(reactions));
      return reactions;
    });
  };

  // Load reactions from localStorage
  useEffect(() => {
    try {
      const savedReactions = localStorage.getItem('messageReactions');
      if (savedReactions) {
        setMessageReactions(JSON.parse(savedReactions));
      }
    } catch (error) {
      console.error('Error loading reactions from localStorage:', error);
    }
  }, []);

  // Toggle search
  const handleToggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      // Focus search input when opening
      setTimeout(() => {
        const searchInput = document.querySelector('input[placeholder="Cari pesan..."]');
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  // Edit message function
  const handleEditMessage = (messageIndex, newText) => {
    setMessages(prev => {
      const updated = [...prev];
      if (updated[messageIndex] && updated[messageIndex].sender === 'user') {
        updated[messageIndex] = {
          ...updated[messageIndex],
          text: newText,
          edited: true,
          editedAt: new Date().toISOString()
        };
        // Save to localStorage
        localStorage.setItem('chatMessages', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Category management functions
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleCreateCategory = (category) => {
    setChatCategories(prev => ({
      ...prev,
      [category.id]: { ...category, messages: [] }
    }));
  };

  const getFilteredMessages = () => {
    if (activeCategory === 'all') {
      return messages;
    }

    // For demo purposes, we'll implement basic filtering
    // In a real app, you'd store category assignments in localStorage
    switch (activeCategory) {
      case 'starred':
        return messages.filter(msg => msg.starred);
      case 'archived':
        return messages.filter(msg => msg.archived);
      default:
        return messages; // Return all messages for other categories in this demo
    }
  };

  return (
    <ThemeProvider>
      <AppContent
        messages={messages}
        loading={loading}
        chatEndRef={chatEndRef}
        inputRef={inputRef}
        onClearChat={handleClearChat}
        onSend={handleSend}
        showSearch={showSearch}
        onToggleSearch={handleToggleSearch}
        onAddReaction={handleAddReaction}
        messageReactions={messageReactions}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        onEditMessage={handleEditMessage}
        onShowThemeCustomizer={() => setShowThemeCustomizer(true)}
      />

      {/* Theme Customizer Modal */}
      <ThemeCustomizer
        isOpen={showThemeCustomizer}
        onClose={() => setShowThemeCustomizer(false)}
      />
    </ThemeProvider>
  );
}

function AppContent({
  messages,
  loading,
  chatEndRef,
  inputRef,
  onClearChat,
  onSend,
  showSearch,
  onToggleSearch,
  onAddReaction,
  messageReactions,
  searchResults,
  setSearchResults,
  onEditMessage,
  onShowThemeCustomizer
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [chatCategories, setChatCategories] = useState({});

  // Category management functions
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleCreateCategory = (category) => {
    setChatCategories(prev => ({
      ...prev,
      [category.id]: { ...category, messages: [] }
    }));
  };

  const getFilteredMessages = () => {
    if (activeCategory === 'all') {
      return messages;
    }
    // For demo purposes, return all messages for other categories
    return messages;
  };

  // Keyboard shortcuts
  const { showHelp } = useKeyboardShortcuts({
    onClearChat,
    onSendMessage: onSend,
    inputRef,
    messages,
    onToggleSearch
  });

  return (
    <div className="flex h-screen bg-gray-100 dark:text-white transition-all duration-300" style={{ background: 'var(--bg-gradient)' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ChatCategories
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onCreateCategory={handleCreateCategory}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onClearChat={onClearChat}
          onShowHelp={showHelp}
          messageCount={messages.length}
          onToggleSearch={onToggleSearch}
          showSearch={showSearch}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onShowThemeCustomizer={onShowThemeCustomizer}
        />

        {showSearch && (
          <SearchBar
            messages={messages}
            onSearch={onToggleSearch}
            onSearchResult={setSearchResults}
            onClose={() => setShowSearch(false)}
          />
        )}

        <ChatBox
          messages={getFilteredMessages()}
          loading={loading}
          chatEndRef={chatEndRef}
          onAddReaction={onAddReaction}
          messageReactions={messageReactions}
          onEditMessage={onEditMessage}
        />
        <ChatInput
          onSend={onSend}
          loading={loading}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}

export default App;