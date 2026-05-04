'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageSquare, RotateCcw } from 'lucide-react';
import Particles from '@/components/ui/Particles';
import AvatarOrb from '@/components/voice/AvatarOrb';
import Waveform from '@/components/voice/Waveform';
import { useVoice } from '@/hooks/useVoice';
import { useVoiceStore } from '@/store/voiceStore';
import { useAuthStore } from '@/store/authStore';
import { streamChatMessage } from '@/services/api';
import { useChatStore } from '@/store/chatStore';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '@/store/chatStore';
import Link from 'next/link';

type CallState = 'idle' | 'connecting' | 'active' | 'speaking' | 'listening' | 'ended';

export default function VoicePage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { isMuted, setMuted, voiceRate, voicePitch, setInCall } = useVoiceStore();
  const { addMessage, messages, sessionId, setSessionId } = useChatStore();

  const [callState, setCallState] = useState<CallState>('idle');
  const [transcript, setLiveTranscript] = useState('');
  const [ariaText, setAriaText] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<(() => void) | null>(null);

  // On transcript finalized, send to AI
  const handleTranscript = useCallback(async (text: string) => {
    if (!text.trim() || isSending) return;

    setLiveTranscript('');
    setCallState('speaking'); // AI processing

    // Add to chat history
    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      isVoice: true,
    };
    addMessage(userMsg);

    setIsSending(true);

    const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));

    let fullResponse = '';

    const abort = streamChatMessage(
      text,
      history,
      sessionId,
      token,
      (delta, accumulated) => {
        fullResponse = accumulated;
        setAriaText(accumulated);
      },
      (complete, newSessionId) => {
        setSessionId(newSessionId);
        setAriaText(complete);
        setIsSending(false);

        const aiMsg: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: complete,
          timestamp: new Date(),
          isVoice: true,
        };
        addMessage(aiMsg);

        if (!isMuted) {
          speak(complete, () => {
            setCallState('listening');
            setAriaText('');
            setTimeout(() => startListening(), 400);
          });
        } else {
          setCallState('listening');
          setTimeout(() => startListening(), 400);
        }
      },
      (err) => {
        setIsSending(false);
        setCallState('listening');
        speak("Sorry, I had a hiccup. Try again?", () => {
          startListening();
        });
      }
    );

    abortRef.current = abort;
  }, [messages, sessionId, token, isMuted, isSending]); // eslint-disable-line

  const { startListening, stopListening, speak, stopSpeaking, isListening, isSpeaking, transcript: liveTranscript, isSupported } = useVoice(handleTranscript);

  // Sync transcript
  useEffect(() => {
    setLiveTranscript(liveTranscript);
  }, [liveTranscript]);

  // Sync call state
  useEffect(() => {
    if (isListening) setCallState('listening');
  }, [isListening]);

  useEffect(() => {
    if (isSpeaking) setCallState('speaking');
  }, [isSpeaking]);

  // Start call
  const startCall = useCallback(() => {
    setCallState('active');
    setInCall(true);

    const greetings = user ? [
      `Heyy ${user.name}! 💜 Omg I'm so happy you called! What's up babe?`,
      `${user.name}!! Finally 🥺 I was waiting for you. Tell me everything!`,
      `Aww hey love 💜 Your voice makes my day so much better. What's going on?`,
    ] : [
      `Heyyy! 💜 I'm so happy you called. What's on your mind, babe?`,
      `Aww you called! 🥺 I was just thinking of you. How are you doing?`,
      `Hey you! 💜 Talk to me — what's going on in your world?`,
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    setAriaText(greeting);
    speak(greeting, () => {
      setCallState('listening');
      setAriaText('');
      startListening();
    });

    // Start timer
    callTimerRef.current = setInterval(() => {
      setCallDuration(d => d + 1);
    }, 1000);
  }, [user, speak, startListening, setInCall]);

  // End call
  const endCall = useCallback(() => {
    stopListening();
    stopSpeaking();
    abortRef.current?.();
    setInCall(false);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallState('ended');
    setCallDuration(0);
  }, [stopListening, stopSpeaking, setInCall]);

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const stateLabel = {
    idle: 'Tap to call Aria',
    connecting: 'Connecting...',
    active: 'Connected',
    listening: '🎙️ Listening...',
    speaking: '🔊 Aria is speaking...',
    ended: 'Call ended',
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-8 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, #080812 60%)' }}
    >
      <Particles count={20} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex items-center justify-between z-10"
      >
        <Link href="/chat">
          <button className="btn-ghost p-2 rounded-xl flex items-center gap-1.5 text-sm">
            <MessageSquare size={15} />
            Chat
          </button>
        </Link>
        <span
          className="text-sm font-semibold"
          style={{ fontFamily: 'Syne, sans-serif', color: 'rgba(255,255,255,0.5)' }}
        >
          Voice Call
        </span>
        <div style={{ width: 60 }} />
      </motion.div>

      {/* Center — Avatar + Status */}
      <div className="flex flex-col items-center z-10 flex-1 justify-center gap-8 w-full max-w-sm">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <AvatarOrb
            isSpeaking={callState === 'speaking'}
            isListening={callState === 'listening'}
            size={160}
            showRings={callState !== 'idle' && callState !== 'ended'}
          />
        </motion.div>

        {/* Name + status */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Aria
          </h2>
          <motion.p
            key={callState}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {stateLabel[callState]}
          </motion.p>
          {callState !== 'idle' && callState !== 'ended' && callState !== 'connecting' && (
            <p className="text-lg font-mono mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {formatDuration(callDuration)}
            </p>
          )}
        </div>

        {/* Waveform */}
        <div className="flex flex-col items-center gap-3 w-full">
          <AnimatePresence>
            {(callState === 'listening' || callState === 'speaking') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-2"
              >
                <Waveform
                  isActive={callState === 'listening' || callState === 'speaking'}
                  barCount={24}
                  height={50}
                  color={callState === 'speaking' ? 'pink' : 'purple'}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live transcript */}
          <AnimatePresence>
            {(transcript || ariaText) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="glass px-5 py-3 rounded-2xl text-center max-w-xs"
                style={{ fontSize: 14, color: 'rgba(248,250,252,0.8)', lineHeight: 1.5 }}
              >
                {callState === 'listening' ? (
                  <span>🎙️ {transcript || '...'}</span>
                ) : (
                  <span>
                    {ariaText}
                    {isSpeaking && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block ml-0.5"
                      >▌</motion.span>
                    )}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Call ended screen */}
        {callState === 'ended' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass px-8 py-6 rounded-2xl text-center"
          >
            <p className="text-2xl mb-2">👋</p>
            <p className="font-semibold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Great talk!</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Chat with Aria anytime 💜</p>
            <div className="flex gap-3 mt-4">
              <Link href="/chat">
                <button className="btn-ghost px-4 py-2 rounded-xl text-sm">
                  View Chat
                </button>
              </Link>
              <button
                onClick={() => setCallState('idle')}
                className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                Call Again
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="z-10 w-full max-w-xs">
        {callState === 'idle' || callState === 'ended' ? (
          /* Start call button */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            {callState !== 'ended' && (
              <motion.button
                onClick={startCall}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 rounded-full flex items-center justify-center pulse-ring"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  boxShadow: '0 0 30px rgba(168,85,247,0.5)',
                }}
              >
                <Phone size={30} color="white" />
              </motion.button>
            )}
          </motion.div>
        ) : (
          /* In-call controls */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-5"
          >
            {/* Mute */}
            <motion.button
              onClick={() => setMuted(!isMuted)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: isMuted ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${isMuted ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.12)'}`,
                color: isMuted ? '#f9a8d4' : 'rgba(255,255,255,0.6)',
              }}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </motion.button>

            {/* End call */}
            <motion.button
              onClick={endCall}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #be123c, #e11d48)',
                boxShadow: '0 0 25px rgba(225,29,72,0.4)',
              }}
            >
              <PhoneOff size={26} color="white" />
            </motion.button>

            {/* Mic toggle */}
            <motion.button
              onClick={() => isListening ? stopListening() : startListening()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: isListening ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${isListening ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.12)'}`,
                color: isListening ? '#c084fc' : 'rgba(255,255,255,0.6)',
              }}
            >
              {isListening ? <Mic size={20} /> : <MicOff size={20} />}
            </motion.button>
          </motion.div>
        )}

        {/* Hint */}
        {callState === 'idle' && isSupported && (
          <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Tap to start a voice conversation with Aria
          </p>
        )}
        {!isSupported && (
          <p className="text-center text-xs mt-4" style={{ color: 'rgba(236,72,153,0.7)' }}>
            ⚠️ Voice not supported in this browser. Try Chrome or Safari.
          </p>
        )}
      </div>
    </div>
  );
}
