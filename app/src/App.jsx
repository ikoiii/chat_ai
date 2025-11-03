import React, { useState, useRef, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import ChatBox from "./components/ChatBox";
import ChatInput from "./components/ChatInput";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

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
  const handleSend = async (messageText) => {
    const userMessage = {
      text: messageText,
      sender: "user",
      timestamp: new Date().toISOString()
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
      const newMessages = [
        {
          text: "Ada yang bisa aku bantu?",
          sender: "ai",
          timestamp: new Date().toISOString()
        },
      ];
      setMessages(newMessages);
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
      />
    </ThemeProvider>
  );
}

function AppContent({ messages, loading, chatEndRef, inputRef, onClearChat, onSend }) {
  // Keyboard shortcuts
  const { showHelp } = useKeyboardShortcuts({
    onClearChat,
    onSendMessage: onSend,
    inputRef,
    messages
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-900 dark:text-white transition-all duration-300">
      <Header
        onClearChat={onClearChat}
        onShowHelp={showHelp}
        messageCount={messages.length}
      />
      <ChatBox
        messages={messages}
        loading={loading}
        chatEndRef={chatEndRef}
      />
      <ChatInput
        onSend={onSend}
        loading={loading}
        inputRef={inputRef}
      />
    </div>
  );
}

export default App;