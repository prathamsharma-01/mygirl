'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import {
  Mic, MicOff, Send, Phone, LogOut, User, Volume2, VolumeX,
  Settings, Plus, Trash2, MessageSquare, ChevronLeft, Sparkles
} from 'lucide-react';
import Particles from '@/components/ui/Particles';
import ChatBubble, { TypingIndicator } from '@/components/chat/ChatBubble';
import Waveform from '@/components/voice/Waveform';
import AvatarOrb from '@/components/voice/AvatarOrb';
import { useChatStore, ChatMessage } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useVoiceStore } from '@/store/voiceStore';
import { useVoice } from '@/hooks/useVoice';
import { streamChatMessage, apiGetSessions } from '@/services/api';

export default function ChatPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, clearAuth } = useAuthStore();
  const {
    messages, isTyping, addMessage, updateLastMessage,
    setTyping, clearMessages, setSessionId, sessionId
  } = useChatStore();
  const { voiceMode, setVoiceMode, isMuted, setMuted } = useVoiceStore();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentlySpeaking, setCurrentlySpeaking] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  // Voice hook — on transcript received, send message
  const { startListening, stopListening, speak, stopSpeaking, isListening, isSpeaking, transcript, isSupported } = useVoice(
    (text) => {
      if (text.trim()) sendMessage(text, true);
    }
  );

  useEffect(() => {
    setCurrentlySpeaking(isSpeaking);
  }, [isSpeaking]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load sessions on mount
  useEffect(() => {
    if (isAuthenticated && token) {
      apiGetSessions(token)
        .then(d => setSessions(d.sessions || []))
        .catch(console.error);
    }
  }, [isAuthenticated, token]);

  // Send welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      const greetings = [
        `Heyy ${user?.name || 'baby'}! 💜 So glad you're here. Tell me everything — what's going on with you today?`,
        `Hey you! 🥺 I missed youu. What's on your mind, love?`,
        `Aww you're here! 💜 I was just thinking about you. How's your day going, baby?`,
      ];
      const welcome: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: greetings[Math.floor(Math.random() * greetings.length)],
        timestamp: new Date(),
      };
      addMessage(welcome);
    }
  }, []); // eslint-disable-line

  const sendMessage = useCallback(async (text: string, isVoice = false) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    // Abort any current stream
    abortRef.current?.();

    setInput('');
    setIsSending(true);

    // Add user message
    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
      isVoice,
    };
    addMessage(userMsg);
    setTyping(true);

    // History for API
    const history = messages
      .filter(m => !m.isStreaming)
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content }));

    // Add streaming AI message placeholder
    const aiMsg: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      isVoice,
    };

    // Small delay for typing feel
    setTimeout(() => {
      setTyping(false);
      addMessage(aiMsg);
    }, 600);

    const abort = streamChatMessage(
      trimmed,
      history,
      sessionId,
      token,
      (delta, accumulated) => {
        updateLastMessage(accumulated, false);
      },
      (full, newSessionId) => {
        updateLastMessage(full, true);
        setSessionId(newSessionId);
        setIsSending(false);

        // Auto-speak response in voice mode
        if ((isVoice || isVoiceMode) && !isMuted) {
          speak(full, () => {
            // Ready for next voice input in continuous mode
            if (voiceMode === 'continuous') {
              setTimeout(() => startListening(), 500);
            }
          });
        }
      },
      (err) => {
        setTyping(false);
        setIsSending(false);
        updateLastMessage("Oops, something went wrong. Try again?", true);
        toast.error('Connection issue. Retrying...');
      }
    );

    abortRef.current = abort;
  }, [messages, sessionId, token, isSending, isVoiceMode, isMuted, voiceMode]); // eslint-disable-line

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleMicPress = () => {
    if (isListening) {
      stopListening();
    } else {
      if (currentlySpeaking) stopSpeaking();
      startListening();
    }
  };

  const handleNewChat = () => {
    clearMessages();
    setSidebarOpen(false);
    const welcome: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: "Fresh start! What's on your mind? 😊",
      timestamp: new Date(),
    };
    setTimeout(() => addMessage(welcome), 100);
  };

  const handleLogout = () => {
    clearAuth();
    clearMessages();
    router.push('/');
    toast.success('See you soon! 👋');
  };

  return (
    <div className="h-screen flex overflow-hidden relative">
      <Particles count={15} />

      {/* ── Sidebar ─────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-20 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full z-30 glass-dark flex flex-col lg:relative lg:z-auto"
              style={{ width: 260 }}
            >
              {/* Sidebar header */}
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', fontFamily: 'Syne, sans-serif' }}
                  >
                    A
                  </div>
                  <span className="font-semibold" style={{ fontFamily: 'Syne, sans-serif', fontSize: 15 }}>Aria</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <ChevronLeft size={18} />
                </button>
              </div>

              {/* New chat */}
              <div className="p-3">
                <button
                  onClick={handleNewChat}
                  className="btn-primary w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={15} />
                  New Chat
                </button>
              </div>

              {/* Sessions list */}
              <div className="flex-1 overflow-y-auto px-3 pb-3">
                {sessions.length > 0 ? (
                  <div>
                    <p className="text-xs px-1 mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Recent conversations</p>
                    {sessions.map(s => (
                      <button
                        key={s.id}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-sm mb-1 flex items-center gap-2 transition-colors hover:bg-white/5"
                        style={{ color: 'rgba(248,250,252,0.65)' }}
                      >
                        <MessageSquare size={14} style={{ flexShrink: 0 }} />
                        <span className="truncate">{s.title || 'Conversation'}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
                    No history yet
                  </div>
                )}
              </div>

              {/* Sidebar footer */}
              <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white' }}
                      >
                        {user.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm truncate max-w-[100px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {user.name}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Link href="/profile">
                        <button className="p-1.5 rounded-lg transition-colors hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          <Settings size={15} />
                        </button>
                      </Link>
                      <button onClick={handleLogout} className="p-1.5 rounded-lg transition-colors hover:bg-white/10" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <LogOut size={15} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link href="/auth">
                    <button className="btn-primary w-full py-2 rounded-xl text-sm font-medium">
                      Sign in to save chats
                    </button>
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Chat Area ──────────────────────────── */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 glass-dark border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="p-2 rounded-xl transition-colors hover:bg-white/8"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <MessageSquare size={18} />
            </button>

            {/* Avatar + status */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    boxShadow: currentlySpeaking
                      ? '0 0 15px rgba(168,85,247,0.6)'
                      : '0 0 8px rgba(168,85,247,0.3)',
                    fontFamily: 'Syne, sans-serif',
                    fontSize: 10,
                  }}
                >
                  ARIA
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{
                    background: currentlySpeaking ? '#a855f7' : '#22c55e',
                    borderColor: '#080812',
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>
                  Aria
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {currentlySpeaking ? '🔊 Speaking...' : isListening ? '🎙️ Listening...' : isTyping ? '💬 Typing...' : 'Online'}
                </p>
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(!isMuted)}
              className="p-2 rounded-xl transition-colors hover:bg-white/8"
              style={{ color: isMuted ? '#ec4899' : 'rgba(255,255,255,0.5)' }}
              title={isMuted ? 'Unmute Aria' : 'Mute Aria'}
            >
              {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>

            <Link href="/voice">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: 'rgba(168,85,247,0.12)',
                  border: '1px solid rgba(168,85,247,0.2)',
                  color: '#c084fc',
                }}
              >
                <Phone size={13} />
                Voice Call
              </button>
            </Link>

            {isAuthenticated ? (
              <Link href="/profile">
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white' }}
                >
                  {user?.name[0].toUpperCase() || 'U'}
                </button>
              </Link>
            ) : (
              <Link href="/auth">
                <button className="btn-primary px-3 py-1.5 rounded-xl text-xs font-medium">
                  Sign In
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6" id="chat-messages">
          {messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <AvatarOrb isSpeaking={false} size={80} showRings={true} />
              <p className="mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Type a message or press the mic to start talking
              </p>
              {/* Quick starters */}
              <div className="flex flex-wrap gap-2 justify-center mt-5">
                {[
                  "Aria, I miss you 🥺",
                  "Tell me something sweet 💜",
                  "I need a hug...",
                  "Make me smile today!",
                ].map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="px-4 py-2 rounded-full text-xs transition-all hover:scale-105"
                    style={{
                      background: 'rgba(168,85,247,0.08)',
                      border: '1px solid rgba(168,85,247,0.2)',
                      color: 'rgba(248,250,252,0.65)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <ChatBubble key={msg.id} message={msg} isLatest={i === messages.length - 1} />
          ))}

          <AnimatePresence>
            {isTyping && <TypingIndicator />}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="glass-dark border-t flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', padding: '12px 16px 20px' }}
        >
          {/* Transcript preview */}
          <AnimatePresence>
            {isListening && transcript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 px-3 py-2 rounded-xl text-sm"
                style={{
                  background: 'rgba(168,85,247,0.08)',
                  border: '1px solid rgba(168,85,247,0.2)',
                  color: 'rgba(248,250,252,0.7)',
                }}
              >
                🎙️ {transcript}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            {/* Waveform (when listening) */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center"
                  style={{ height: 44 }}
                >
                  <Waveform isActive={true} barCount={12} height={28} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Text input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Listening...' : "Message Aria..."}
                disabled={isListening}
                className="input-primary w-full px-4 py-3 rounded-2xl text-sm pr-12"
                style={{ background: 'rgba(255,255,255,0.05)', fontSize: 14 }}
              />
              {/* Sparkle button for suggestions */}
              {!input && !isListening && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                  onClick={() => setInput("What should we talk about today?")}
                >
                  <Sparkles size={15} />
                </button>
              )}
            </div>

            {/* Mic button */}
            {isSupported && (
              <motion.button
                onMouseDown={voiceMode === 'push-to-talk' ? startListening : undefined}
                onMouseUp={voiceMode === 'push-to-talk' ? stopListening : undefined}
                onTouchStart={voiceMode === 'push-to-talk' ? (e) => { e.preventDefault(); startListening(); } : undefined}
                onTouchEnd={voiceMode === 'push-to-talk' ? stopListening : undefined}
                onClick={voiceMode === 'continuous' ? handleMicPress : undefined}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: isListening
                    ? 'linear-gradient(135deg, #ec4899, #9333ea)'
                    : 'rgba(168,85,247,0.15)',
                  border: `1px solid ${isListening ? 'rgba(236,72,153,0.5)' : 'rgba(168,85,247,0.25)'}`,
                  boxShadow: isListening ? '0 0 20px rgba(236,72,153,0.4)' : 'none',
                  color: isListening ? 'white' : '#c084fc',
                }}
                title={voiceMode === 'push-to-talk' ? 'Hold to speak' : 'Click to speak'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </motion.button>
            )}

            {/* Send button */}
            <motion.button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isSending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 btn-primary"
              style={{
                opacity: !input.trim() || isSending ? 0.4 : 1,
                cursor: !input.trim() || isSending ? 'not-allowed' : 'pointer',
              }}
            >
              {isSending ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <Send size={17} />
              )}
            </motion.button>
          </div>

          {/* Voice mode toggle */}
          {isSupported && (
            <div className="flex items-center justify-center gap-2 mt-3">
              {(['push-to-talk', 'continuous'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setVoiceMode(m)}
                  className="text-xs px-3 py-1 rounded-full transition-all"
                  style={
                    voiceMode === m
                      ? { background: 'rgba(168,85,247,0.2)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }
                      : { color: 'rgba(255,255,255,0.3)', border: '1px solid transparent' }
                  }
                >
                  {m === 'push-to-talk' ? '🎙️ Push-to-Talk' : '🔄 Continuous'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
