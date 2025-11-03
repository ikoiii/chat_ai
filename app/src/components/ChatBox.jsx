import ChatMessage from "./ChatMessage";

export default function ChatBox({ messages, loading, chatEndRef, onAddReaction, messageReactions, onEditMessage }) {
  return (
    <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-slate-900 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-slate-700 scrollbar-track-gray-200 dark:scrollbar-track-slate-900">
      {messages.map((msg, idx) => (
        <div key={idx} data-message-index={idx}>
          <ChatMessage
            sender={msg.sender}
            text={msg.text}
            isError={msg.isError}
            timestamp={msg.timestamp}
            messageId={`msg-${idx}`}
            reactions={messageReactions[`msg-${idx}`] || []}
            onAddReaction={onAddReaction}
            onEditMessage={onEditMessage}
            messageIndex={idx}
            edited={msg.edited}
            editedAt={msg.editedAt}
            isVoice={msg.isVoice}
            audioURL={msg.audioURL}
            duration={msg.duration}
            files={msg.files || []}
          />
        </div>
      ))}

      {loading && (
        <div className="flex justify-start animate-fade-in">
          <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-600 max-w-[85%] sm:max-w-[75%]">
            {/* Typing Indicator */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">AI sedang mengetik...</span>
            </div>

            {/* Skeleton Loading */}
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={chatEndRef}></div>
    </main>
  );
}
