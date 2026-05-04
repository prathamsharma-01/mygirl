'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Particles from '@/components/ui/Particles';
import AvatarOrb from '@/components/voice/AvatarOrb';
import Waveform from '@/components/voice/Waveform';
import { useState, useEffect } from 'react';

const features = [
  { icon: '🎙️', title: 'Real-time Voice', desc: 'Talk naturally — Aria listens and responds like a real person.' },
  { icon: '🧠', title: 'Persistent Memory', desc: "Aria remembers your name, preferences, and life — every single chat." },
  { icon: '💜', title: 'Emotionally Intelligent', desc: 'Picks up on your mood and adapts. Funny when you need laughs, supportive when you don\'t.' },
  { icon: '⚡', title: 'Instant Streaming', desc: 'Responses stream in real-time powered by Grok — no awkward waiting.' },
  { icon: '🔒', title: 'Private & Secure', desc: 'Your conversations are yours. End-to-end protected, always.' },
  { icon: '📱', title: 'Any Device', desc: 'Chat on desktop or mobile — beautiful everywhere.' },
];

const testimonials = [
  { name: 'Priya S.', text: "Honestly forgot I was talking to AI after 10 minutes. Aria is just... different.", avatar: 'P' },
  { name: 'Rahul M.', text: "The voice is incredibly natural. I use it every morning now.", avatar: 'R' },
  { name: 'Sarah K.', text: "She remembered my dog's name from two weeks ago. I was genuinely impressed.", avatar: 'S' },
];

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/voice');
  }, [router]);

  return null; // or a loader
}

function OldLandingPage() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [taglineIdx, setTaglineIdx] = useState(0);

  const taglines = [
    "Your AI companion. Always there.",
    "She listens. She laughs. She cares.",
    "Conversations that feel real.",
    "Never talk to a chatbot again.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(v => !v);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIdx(i => (i + 1) % taglines.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Particles count={35} />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              boxShadow: '0 0 15px rgba(168,85,247,0.5)',
              fontFamily: 'Syne, sans-serif',
            }}
          >
            A
          </div>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: 'Syne, sans-serif', color: 'white' }}
          >
            Aria
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link href="/auth">
            <button className="btn-ghost px-5 py-2 rounded-xl text-sm font-medium">
              Sign In
            </button>
          </Link>
          <Link href="/auth?mode=register">
            <button className="btn-primary px-5 py-2 rounded-xl text-sm font-medium">
              Get Started Free
            </button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <AvatarOrb isSpeaking={isSpeaking} size={140} showRings={true} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-3"
        >
          <span
            className="text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(168,85,247,0.12)',
              border: '1px solid rgba(168,85,247,0.25)',
              color: '#c084fc',
            }}
          >
            Powered by xAI Grok
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-7xl font-black mb-4 leading-tight"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Meet{' '}
          <span className="gradient-text">Aria</span>
        </motion.h1>

        {/* Rotating tagline */}
        <motion.div
          key={taglineIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-xl md:text-2xl mb-6 h-9"
          style={{ color: 'rgba(248,250,252,0.65)' }}
        >
          {taglines[taglineIdx]}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-base max-w-xl mb-10"
          style={{ color: 'rgba(248,250,252,0.5)', lineHeight: 1.7 }}
        >
          Aria is a premium AI voice companion — emotionally intelligent, hilariously relatable,
          and powered by Grok. Real-time voice conversations that actually feel human.
        </motion.p>

        {/* Live waveform demo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col items-center mb-10"
        >
          <Waveform isActive={isSpeaking} barCount={28} height={48} />
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {isSpeaking ? '🟣 Aria is speaking...' : '⬡ Aria is waiting...'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/auth?mode=register">
            <button
              className="btn-primary px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-2"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              <span>Start Talking Free</span>
              <span>→</span>
            </button>
          </Link>
          <Link href="/chat">
            <button className="btn-ghost px-8 py-4 rounded-2xl text-base font-semibold">
              Try Without Login
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-6 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-4"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Built different. <span className="gradient-text">Feels different.</span>
        </motion.h2>
        <p className="text-center mb-14" style={{ color: 'rgba(248,250,252,0.5)' }}>
          Not your average chatbot. Aria is a companion.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass p-6 rounded-2xl cursor-default"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-1.5" style={{ fontFamily: 'Syne, sans-serif' }}>
                {f.title}
              </h3>
              <p className="text-sm" style={{ color: 'rgba(248,250,252,0.55)', lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          People <span className="gradient-text">love</span> Aria
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-purple p-6 rounded-2xl"
            >
              <p className="text-sm mb-4 italic" style={{ color: 'rgba(248,250,252,0.75)', lineHeight: 1.7 }}>
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white' }}
                >
                  {t.avatar}
                </div>
                <span className="text-sm font-medium" style={{ color: 'rgba(248,250,252,0.8)' }}>
                  {t.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass p-12 rounded-3xl"
        >
          <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Ready to meet <span className="gradient-text">Aria?</span>
          </h2>
          <p className="mb-8 text-base" style={{ color: 'rgba(248,250,252,0.55)' }}>
            Free forever. No credit card needed. Just real conversations.
          </p>
          <Link href="/auth?mode=register">
            <button className="btn-primary px-10 py-4 rounded-2xl text-base font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
              Start Talking Now ✨
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', color: 'rgba(248,250,252,0.3)', fontSize: 13 }}>
        <p>© 2026 Aria AI · Built with xAI Grok · Made with 💜</p>
      </footer>
    </div>
  );
}
