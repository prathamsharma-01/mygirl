'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVoiceStore } from '@/store/voiceStore';

interface UseVoiceReturn {
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, onEnd?: () => void) => void;
  stopSpeaking: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  isSupported: boolean;
}

// Use Google Translate TTS — 100% free, no API key needed
// Sounds like a real, sweet girl with a natural accent
async function speakWithElevenLabs(
  text: string,
  onStart: () => void,
  onEnd: () => void,
  onError: () => void,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
) {
  try {
    // Call backend TTS proxy (ElevenLabs — sweet voice, free tier)
    const response = await fetch('http://localhost:5001/api/tts/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error(`TTS failed: ${response.status}`);

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => onStart();
    audio.onended = () => { 
      URL.revokeObjectURL(url); 
      audio.onerror = null; // Clear handler
      onEnd(); 
    };
    audio.onerror = () => { 
      URL.revokeObjectURL(url); 
      audio.onerror = null;
      onError(); 
    };

    await audio.play();
  } catch (err) {
    console.warn('Premium TTS (ElevenLabs/Google) failed in backend, falling back to browser-local TTS:', err);
    onError();
  }
}

export function useVoice(onTranscript?: (text: string) => void): UseVoiceReturn {
  const { voiceRate, voicePitch, selectedVoiceName, setVoiceStatus, isMuted } = useVoiceStore();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finalTranscriptRef = useRef('');
  const isRecognitionActiveRef = useRef(false);

  // Initialize speech APIs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const supported = !!SpeechRecognition;
    setIsSupported(supported);
    synthRef.current = window.speechSynthesis;

    if (supported) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        isRecognitionActiveRef.current = true;
        setVoiceStatus('listening');
        setTranscript('');
        finalTranscriptRef.current = '';
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += t;
          } else {
            interim += t;
          }
        }
        if (final) {
          finalTranscriptRef.current += final;
          setTranscript(finalTranscriptRef.current);
        } else {
          setTranscript(finalTranscriptRef.current + interim);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        isRecognitionActiveRef.current = false;
        setVoiceStatus('idle');
        const finalText = finalTranscriptRef.current.trim();
        if (finalText && onTranscript) {
          onTranscript(finalText);
        }
        setTranscript('');
        finalTranscriptRef.current = '';
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        isRecognitionActiveRef.current = false;
        setVoiceStatus('idle');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
      synthRef.current?.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []); // eslint-disable-line

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isRecognitionActiveRef.current) return;
    
    // Stop any current speech first
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null; // Prevent triggering fallback
      audioRef.current.pause();
      audioRef.current.removeAttribute('src'); // Better than src = ''
      audioRef.current.load();
      setIsSpeaking(false);
    }
    synthRef.current?.cancel();

    try {
      isRecognitionActiveRef.current = true;
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Recognition start error:', e);
      // Force reset active ref if it failed to start
      isRecognitionActiveRef.current = false;
    }
  }, []); // Remove isListening dependency to avoid stale state issues

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Recognition stop error:', e);
      }
    }
  }, []);

  // Fallback to browser TTS (female voice, sweet settings)
  const browserSpeak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current) { onEnd?.(); return; }
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const doSpeak = (voices: SpeechSynthesisVoice[]) => {
      const BANNED_MALES = /\b(david|mark|james|alex|daniel|guy|fred|rishi|oliver|thomas|george|arthur|aaron|bruce|chad|eric|gordon|lee|paul|reed|ralph|wayne|will)\b/i;
      const femaleVoices = voices.filter(v => {
        const n = v.name.toLowerCase();
        return /female|woman|girl|siri|samantha|moira|karen|victoria|sharon|sara|tessa|aria|zira|susan|fiona|allison|ava|nora|kate|emma|lisa/i.test(n) && !BANNED_MALES.test(n);
      });

      const priority = ['moira', 'karen', 'samantha', 'siri', 'victoria', 'tessa', 'google uk english female'];
      let selected: SpeechSynthesisVoice | undefined;
      for (const name of priority) {
        selected = femaleVoices.find(v => v.name.toLowerCase().includes(name));
        if (selected) break;
      }
      if (!selected) selected = femaleVoices[0] || voices.find(v => !BANNED_MALES.test(v.name));
      if (selected) utterance.voice = selected;

      utterance.rate = 0.88;
      utterance.pitch = 1.15;
      utterance.volume = 1;

      utterance.onstart = () => { setIsSpeaking(true); setVoiceStatus('speaking'); };
      utterance.onend = () => { setIsSpeaking(false); setVoiceStatus('idle'); onEnd?.(); };
      utterance.onerror = () => { setIsSpeaking(false); setVoiceStatus('idle'); onEnd?.(); };

      utteranceRef.current = utterance;
      synthRef.current!.speak(utterance);
    };

    const voices = synthRef.current.getVoices();
    if (voices.length > 0) {
      doSpeak(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak(window.speechSynthesis.getVoices());
      };
    }
  }, [voiceRate, voicePitch, selectedVoiceName, setVoiceStatus]); // eslint-disable-line

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (isMuted) { onEnd?.(); return; }

    setIsSpeaking(true);
    setVoiceStatus('speaking');

    // Try ElevenLabs TTS first (sweet girl voice)
    speakWithElevenLabs(
      text,
      () => { setIsSpeaking(true); setVoiceStatus('speaking'); },
      () => { setIsSpeaking(false); setVoiceStatus('idle'); onEnd?.(); },
      () => {
        // ElevenLabs failed — fall back to browser TTS
        setIsSpeaking(false);
        setVoiceStatus('idle');
        browserSpeak(text, onEnd);
      },
      audioRef
    );
  }, [isMuted, browserSpeak, setVoiceStatus]);

  const stopSpeaking = useCallback(() => {
    // Stop Google TTS audio
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    // Stop browser TTS
    if (synthRef.current?.speaking) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setVoiceStatus('idle');
  }, [setVoiceStatus]);

  return {
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isListening,
    isSpeaking,
    transcript,
    isSupported,
  };
}
