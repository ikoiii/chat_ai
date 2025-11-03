import { useEffect, useState, useRef } from "react";
import { Copy, Heart, MoreHorizontal, Edit2, Check, X, Play, Pause, File, Image as ImageIcon, FileText, Download, Eye } from 'lucide-react';

export default function ChatMessage({ sender, text, isError, timestamp, onAddReaction, messageId, reactions = [], onEditMessage, messageIndex, edited, editedAt, isVoice, audioURL, duration, files = [] }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const audioRef = useRef(null);
  const isUser = sender === "user";
  const isErrorMessage = isError && !isUser;
  const canEdit = isUser && !isEditing && !isError && !isVoice; // Voice messages can't be edited

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Update editedText when text prop changes
  useEffect(() => {
    setEditedText(text);
  }, [text]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowReactions(false);
      setShowContextMenu(false);
    };

    if (showReactions || showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showReactions, showContextMenu]);

  // Audio playback handling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isVoice) return;

    const updateTime = () => setPlaybackTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isVoice]);

  const togglePlayback = () => {
    if (!audioRef.current || !isVoice) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return ImageIcon;
    } else if (file.type.includes('text') || file.type.includes('markdown')) {
      return FileText;
    } else {
      return File;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const previewFile = (file) => {
    if (file.type.startsWith('image/')) {
      window.open(file.url, '_blank');
    } else {
      // For non-image files, could implement a preview modal
      alert(`Preview for ${file.name} not available in this demo`);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedText(text);
    setShowContextMenu(false);
  };

  const handleSaveEdit = () => {
    if (editedText.trim() && editedText !== text) {
      onEditMessage?.(messageIndex, editedText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(text);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    try {
      const date = timestamp ? new Date(timestamp) : new Date();
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleReaction = (emoji) => {
    if (onAddReaction) {
      onAddReaction(messageId, emoji);
    }
    setShowReactions(false);
  };

  const reactionEmojis = [
    { icon: '❤️', label: 'Love' },
    { icon: '👍', label: 'Like' },
    { icon: '👎', label: 'Dislike' },
    { icon: '😄', label: 'Laugh' },
    { icon: '🤔', label: 'Think' },
    { icon: '😮', label: 'Wow' }
  ];

  const getReactionCount = (emoji) => {
    const reaction = reactions.find(r => r.emoji === emoji);
    return reaction ? reaction.count : 0;
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowContextMenu(!showContextMenu);
      }}
    >
      <div className="relative group">
        <div
          className={`max-w-[85%] sm:max-w-[75%] px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-2xl text-sm shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
            isUser
              ? "bg-blue-600 text-white rounded-br-none hover:bg-blue-700"
              : isErrorMessage
              ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-bl-none hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
              : "bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-none hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600"
          }`}
        >
          {/* Message Content */}
          {isEditing ? (
            <div className="relative">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                className="w-full bg-transparent border border-blue-400 dark:border-blue-500 rounded px-2 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                rows={3}
                autoFocus
                placeholder="Edit your message..."
              />
              <div className="absolute -top-2 -right-2 flex gap-1">
                <button
                  onClick={handleSaveEdit}
                  className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                  title="Save (Enter)"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Cancel (Esc)"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : isVoice ? (
            <div className="space-y-3">
              {/* Voice Player */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayback}
                  className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-all transform hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <div className="flex-1">
                  <div className="relative h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
                    <div
                      className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${duration ? (playbackTime / duration) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs opacity-70">
                    <span>{formatDuration(playbackTime)}</span>
                    <span>{formatDuration(duration || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Transcript */}
              {text && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs opacity-70 mb-1">Transcript:</div>
                  <div className="whitespace-pre-wrap break-words">{text}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Text Content */}
              {text && (
                <div className="whitespace-pre-wrap break-words">{text}</div>
              )}

              {/* File Attachments */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs opacity-70 mb-2">
                    {files.length} file{files.length > 1 ? 's' : ''} attached
                  </div>
                  {files.map((file, index) => {
                    const Icon = getFileIcon(file);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10"
                      >
                        <div className="flex-shrink-0">
                          <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => previewFile(file)}
                            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => downloadFile(file)}
                            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Hidden Audio Element */}
          {isVoice && audioURL && (
            <audio ref={audioRef} src={audioURL} preload="metadata" />
          )}

          {/* Reactions Display */}
          {!isEditing && reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {reactions.map((reaction, idx) => (
                <button
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors text-xs"
                  onClick={() => handleReaction(reaction.emoji)}
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-xs opacity-70">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-1 opacity-70 flex items-center gap-1 ${isUser ? "text-blue-200" : isErrorMessage ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
            <span>{formatTime(timestamp)}</span>
            {edited && <span className="text-xs opacity-60">(edited)</span>}
          </div>
        </div>

        {/* Hover Actions */}
        <div className={`absolute ${isUser ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 ${isUser ? '-ml-2' : '-mr-2'}`}>
          {!isEditing && (
            <>
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                title="Add reaction"
              >
                <Heart className="w-3 h-3" />
              </button>

              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                title="Copy message"
              >
                <Copy className="w-3 h-3" />
              </button>

              {canEdit && (
                <button
                  onClick={handleStartEdit}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  title="Edit message"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </>
          )}

          <button
            onClick={() => setShowContextMenu(!showContextMenu)}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            title="More options"
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>

        {/* Reaction Picker */}
        {showReactions && (
          <div
            className={`absolute ${isUser ? 'right-0' : 'left-0'} top-full mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-2 z-10`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-1">
              {reactionEmojis.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleReaction(emoji.icon)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-lg hover:scale-110 transform"
                  title={emoji.label}
                >
                  {emoji.icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Context Menu */}
        {showContextMenu && (
          <div
            className={`absolute ${isUser ? 'right-0' : 'left-0'} top-full mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-10 min-w-[150px]`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                handleCopy();
                setShowContextMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            {canEdit && (
              <button
                onClick={() => {
                  handleStartEdit();
                  setShowContextMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Message
              </button>
            )}
            <button
              onClick={() => {
                setShowReactions(true);
                setShowContextMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Add Reaction
            </button>
          </div>
        )}

        {/* Copy Feedback */}
        {copied && (
          <div className={`absolute ${isUser ? 'right-0' : 'left-0'} top-full mt-2 bg-green-600 text-white px-2 py-1 rounded text-xs z-10`}>
            Copied!
          </div>
        )}
      </div>
    </div>
  );
}
