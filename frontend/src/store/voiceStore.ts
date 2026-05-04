import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type VoiceMode = 'push-to-talk' | 'continuous';
type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceState {
  isVoiceEnabled: boolean;
  voiceMode: VoiceMode;
  voiceStatus: VoiceStatus;
  isInCall: boolean;
  isMuted: boolean;
  voiceRate: number;
  voicePitch: number;
  selectedVoiceName: string;

  setVoiceEnabled: (val: boolean) => void;
  setVoiceMode: (mode: VoiceMode) => void;
  setVoiceStatus: (status: VoiceStatus) => void;
  setInCall: (val: boolean) => void;
  setMuted: (val: boolean) => void;
  setVoiceRate: (rate: number) => void;
  setVoicePitch: (pitch: number) => void;
  setSelectedVoiceName: (name: string) => void;
}

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set) => ({
      isVoiceEnabled: true,
      voiceMode: 'push-to-talk',
      voiceStatus: 'idle',
      isInCall: false,
      isMuted: false,
      voiceRate: 0.9,
      voicePitch: 1.1,
      selectedVoiceName: '',

      setVoiceEnabled: (val) => set({ isVoiceEnabled: val }),
      setVoiceMode: (mode) => set({ voiceMode: mode }),
      setVoiceStatus: (status) => set({ voiceStatus: status }),
      setInCall: (val) => set({ isInCall: val }),
      setMuted: (val) => set({ isMuted: val }),
      setVoiceRate: (rate) => set({ voiceRate: rate }),
      setVoicePitch: (pitch) => set({ voicePitch: pitch }),
      setSelectedVoiceName: (name) => set({ selectedVoiceName: name }),
    }),
    {
      name: 'aria-voice',
      partialize: (state) => ({
        voiceMode: state.voiceMode,
        voiceRate: state.voiceRate,
        voicePitch: state.voicePitch,
        selectedVoiceName: state.selectedVoiceName,
      }),
    }
  )
);
