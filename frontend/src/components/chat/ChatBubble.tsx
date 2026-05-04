'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/store/chatStore';

interface ChatBubbleProps {
  message: ChatMessage;
  isLatest?: boolean;
}

export default function ChatBubble({ message, isLatest }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
      >
        {/* AI avatar dot */}
        {!isUser && (
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 mr-2 mt-1 flex items-center justify-center text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              boxShadow: '0 0 10px rgba(168,85,247,0.4)',
              color: 'white',
              fontFamily: 'Syne, sans-serif',
              fontSize: 9,
            }}
          >
            A
          </div>
        )}

        <div
          className={`px-4 py-3 text-sm leading-relaxed ${isUser ? 'bubble-user' : 'bubble-ai'}`}
          style={{
            color: isUser ? 'white' : 'rgba(248,250,252,0.9)',
            ...(message.isVoice && {
              borderLeft: isUser ? 'none' : '2px solid rgba(168,85,247,0.4)',
            }),
          }}
        >
          {message.isStreaming ? (
            <>
              {message.content}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block ml-0.5 w-0.5 h-4 bg-purple-400 align-text-bottom"
              />
            </>
          ) : (
            message.content
          )}

          {/* Voice indicator */}
          {message.isVoice && (
            <span className="ml-2 text-xs opacity-50">
              {isUser ? '🎙️' : '🔊'}
            </span>
          )}
        </div>

        {/* User avatar dot */}
        {isUser && (
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 ml-2 mt-1 flex items-center justify-center text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white',
            }}
          >
            U
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Typing indicator component
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-center gap-2 mb-3"
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          boxShadow: '0 0 10px rgba(168,85,247,0.4)',
          color: 'white',
          fontFamily: 'Syne, sans-serif',
          fontSize: 9,
        }}
      >
        A
      </div>
      <div
        className="px-4 py-3 bubble-ai flex items-center gap-1.5"
        style={{ minWidth: 60 }}
      >
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </motion.div>
  );
}
