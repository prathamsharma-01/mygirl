# Aria — Premium AI Voice Companion 💜

> A futuristic AI voice companion powered by xAI Grok with real-time voice conversations, emotional intelligence, and a stunning neon interface.

![Tech Stack](https://img.shields.io/badge/AI-xAI%20Grok-blueviolet) ![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black) ![Express](https://img.shields.io/badge/Backend-Express-green) ![Supabase](https://img.shields.io/badge/DB-Supabase-teal)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎙️ Real-time Voice | Browser Speech Recognition → Grok AI → SpeechSynthesis |
| 💜 Aria Personality | Emotionally intelligent, funny, caring companion |
| ⚡ Streaming Responses | Token-by-token streaming via SSE |
| 🧠 Persistent Memory | Aria remembers you across conversations |
| 📞 Voice Call Screen | Full calling-screen UI with waveform |
| 🌊 Live Waveform | Animated bars for speaking/listening |
| 🔄 Continuous Mode | Hands-free back-and-forth conversation |
| 🔒 Secure Auth | JWT-based authentication |
| 💾 Supabase DB | Persistent chat history & preferences |

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `supabase_schema.sql` → Run
3. Get your **Project URL** and **API Keys** from Settings → API

### 3. Configure Backend

Edit `backend/.env`:
```env
PORT=5000
GROK_API_KEY=your-grok-api-key
GROK_MODEL=grok-3-mini
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-super-secret-min-32-chars
FRONTEND_URL=http://localhost:3000
```

### 4. Configure Frontend

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### 5. Run the App

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
# or with auto-reload:
npx nodemon server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 📁 Project Structure

```
girlfriend/
├── backend/
│   ├── ai/
│   │   └── grok.js          # Grok API + Aria personality
│   ├── database/
│   │   └── supabase.js      # DB client
│   ├── memory/
│   │   └── memoryManager.js # Persistent AI memory
│   ├── middleware/
│   │   └── auth.js          # JWT auth
│   ├── routes/
│   │   ├── auth.js          # Register/login
│   │   ├── chat.js          # Streaming chat API
│   │   └── user.js          # Profile & preferences
│   ├── websocket/
│   │   └── handler.js       # Socket.io real-time
│   └── server.js            # Express entry point
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx        # Landing page
│       │   ├── auth/page.tsx   # Login / Register
│       │   ├── chat/page.tsx   # Main chat interface
│       │   ├── voice/page.tsx  # Voice call screen
│       │   └── profile/page.tsx # Settings & memory
│       ├── components/
│       │   ├── chat/ChatBubble.tsx
│       │   ├── voice/AvatarOrb.tsx
│       │   ├── voice/Waveform.tsx
│       │   └── ui/Particles.tsx
│       ├── hooks/
│       │   └── useVoice.ts     # Speech recognition + TTS
│       ├── services/
│       │   ├── api.ts          # REST API calls
│       │   └── socket.ts       # WebSocket client
│       └── store/
│           ├── authStore.ts    # Auth state (Zustand)
│           ├── chatStore.ts    # Chat state
│           └── voiceStore.ts   # Voice settings
│
└── supabase_schema.sql       # Database schema
```

---

## 🌐 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with animated avatar |
| `/auth` | Login / Register |
| `/chat` | Main chat interface with voice |
| `/voice` | Full-screen voice call mode |
| `/profile` | Settings, memory, voice config |

---

## 🤖 Aria's Personality

Aria is configured with a carefully crafted system prompt that makes her:
- **Short & punchy** — 1–3 sentence responses by default
- **Emotionally tuned** — picks up on mood from your words
- **Casual & real** — uses natural speech patterns
- **Memory-aware** — references things you've shared before

Modify the system prompt in `backend/ai/grok.js` to adjust her personality.

---

## 🎙️ Voice Features

| Feature | How it works |
|---------|-------------|
| Push-to-Talk | Hold mic button while speaking |
| Continuous Mode | AI auto-listens after each response |
| Interruption | Tap mic anytime to cut Aria off |
| Female Voice | Auto-selects best available female voice |
| Rate/Pitch | Adjustable in Profile settings |

---

## 🚢 Deployment

### Backend → Render
1. Push `backend/` to GitHub
2. Create Web Service on Render
3. Build: `npm install`, Start: `node server.js`
4. Add env vars from `.env`

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import to Vercel
3. Add env vars (`NEXT_PUBLIC_BACKEND_URL` = your Render URL)

---

## 📋 Supabase Setup Checklist

- [ ] Create Supabase project
- [ ] Run `supabase_schema.sql` in SQL Editor
- [ ] Copy Project URL → `SUPABASE_URL`
- [ ] Copy `service_role` key → `SUPABASE_SERVICE_KEY` (backend)
- [ ] Copy `anon` key → `SUPABASE_ANON_KEY` (backend + frontend)

---

Built with 💜 by Pratham Sharma · Powered by xAI Grok
