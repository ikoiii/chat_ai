import ChatMessage from "./ChatMessage";

export default function ChatBox({ messages, loading, chatEndRef }) {
  return (
    <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-slate-900 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-slate-700 scrollbar-track-gray-200 dark:scrollbar-track-slate-900">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} sender={msg.sender} text={msg.text} />
      ))}

      {loading && (
        <div className="flex justify-start animate-fade-in">
          <div className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-2xl shadow-md border border-gray-300 dark:border-slate-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={chatEndRef}></div>
    </main>
  );
}
