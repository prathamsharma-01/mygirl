import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isVoice?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  sessionId: string | null;
  isTyping: boolean;
  isStreaming: boolean;
  currentStreamContent: string;

  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string, done?: boolean) => void;
  setTyping: (val: boolean) => void;
  setStreaming: (val: boolean, content?: string) => void;
  setSessionId: (id: string) => void;
  clearMessages: () => void;
  loadHistory: (messages: ChatMessage[]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sessionId: null,
  isTyping: false,
  isStreaming: false,
  currentStreamContent: '',

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateLastMessage: (content, done = false) =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = {
          ...last,
          content,
          isStreaming: !done,
        };
      }
      return { messages: msgs, isStreaming: !done, currentStreamContent: done ? '' : content };
    }),

  setTyping: (val) => set({ isTyping: val }),

  setStreaming: (val, content = '') =>
    set({ isStreaming: val, currentStreamContent: content }),

  setSessionId: (id) => set({ sessionId: id }),

  clearMessages: () =>
    set({ messages: [], sessionId: null, currentStreamContent: '' }),

  loadHistory: (messages) => set({ messages }),
}));
