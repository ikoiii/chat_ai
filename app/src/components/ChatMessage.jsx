import { useEffect, useState } from "react";

export default function ChatMessage({ sender, text, isError, timestamp }) {
  const [isVisible, setIsVisible] = useState(false);
  const isUser = sender === "user";
  const isErrorMessage = isError && !isUser;

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Format timestamp for display
  const formatTime = (timestamp) => {
    try {
      const date = timestamp ? new Date(timestamp) : new Date();
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-2xl text-sm shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none hover:bg-blue-700"
            : isErrorMessage
            ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-bl-none hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
            : "bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-none hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{text}</div>
        <div className={`text-xs mt-1 opacity-70 ${isUser ? "text-blue-200" : isErrorMessage ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
}
