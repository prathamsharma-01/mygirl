'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Brain, Volume2, Shield, Trash2,
  Save, User, MessageSquare, Mic, LogOut
} from 'lucide-react';
import Particles from '@/components/ui/Particles';
import { useAuthStore } from '@/store/authStore';
import { useVoiceStore } from '@/store/voiceStore';
import { apiGetProfile, apiUpdatePreferences, apiUpdateMemory, apiClearMemory } from '@/services/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, clearAuth } = useAuthStore();
  const {
    voiceRate, voicePitch, setVoiceRate, setVoicePitch,
    voiceMode, setVoiceMode, isMuted, setMuted
  } = useVoiceStore();

  const [memory, setMemory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ totalMessages: 0, totalSessions: 0 });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    loadProfile();
  }, [isAuthenticated]); // eslint-disable-line

  const loadProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { memory: m } = await apiGetProfile(token);
      setMemory(m || '');
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await apiUpdatePreferences({ voiceRate, voicePitch, voiceMode, isMuted }, token);
      await apiUpdateMemory(memory, token);
      toast.success('Settings saved! 💜');
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const clearMemoryHandler = async () => {
    if (!token) return;
    if (!confirm("Clear Aria's memory of you? She'll start fresh.")) return;
    try {
      await apiClearMemory(token);
      setMemory('');
      toast.success("Memory cleared — fresh start! 🧹");
    } catch (err: any) {
      toast.error(err.message || 'Failed to clear memory');
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/');
    toast.success('See you soon! 👋');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  const sectionClass = 'glass p-6 rounded-2xl mb-5';

  return (
    <div className="min-h-screen relative">
      <Particles count={15} />

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/chat">
            <button className="flex items-center gap-2 text-sm transition-colors hover:text-purple-400" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <ArrowLeft size={15} />
              Back to Chat
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm transition-colors hover:text-red-400"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${sectionClass} flex items-center gap-5`}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              boxShadow: '0 0 20px rgba(168,85,247,0.35)',
              fontFamily: 'Syne, sans-serif',
            }}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
              {user?.name}
            </h1>
            <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {user?.email}
            </p>
            <div className="flex gap-4 mt-2">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                💬 {stats.totalMessages} messages
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                🗂 {stats.totalSessions} sessions
              </span>
            </div>
          </div>
        </motion.div>

        {/* Voice Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={sectionClass}
        >
          <div className="flex items-center gap-2 mb-5">
            <Volume2 size={16} style={{ color: '#a855f7' }} />
            <h2 className="font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
              Voice Settings
            </h2>
          </div>

          {/* Voice Rate */}
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Speech Rate
              </label>
              <span className="text-sm" style={{ color: '#a855f7' }}>
                {voiceRate.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.8"
              step="0.1"
              value={voiceRate}
              onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #7c3aed ${((voiceRate - 0.5) / 1.3) * 100}%, rgba(255,255,255,0.1) 0%)`,
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Slow</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Fast</span>
            </div>
          </div>

          {/* Voice Pitch */}
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Voice Pitch
              </label>
              <span className="text-sm" style={{ color: '#a855f7' }}>
                {voicePitch.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={voicePitch}
              onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #a855f7 ${((voicePitch - 0.5) / 1.5) * 100}%, rgba(255,255,255,0.1) 0%)`,
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Low</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>High</span>
            </div>
          </div>

          {/* Voice Mode */}
          <div className="mb-4">
            <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Default Voice Mode
            </label>
            <div className="flex gap-3">
              {(['push-to-talk', 'continuous'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setVoiceMode(m)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={
                    voiceMode === m
                      ? { background: 'linear-gradient(135deg, #7c3aed, #9333ea)', color: 'white', boxShadow: '0 0 15px rgba(124,58,237,0.3)' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                  }
                >
                  {m === 'push-to-talk' ? '🎙️ Push-to-Talk' : '🔄 Continuous'}
                </button>
              ))}
            </div>
          </div>

          {/* Mute toggle */}
          <div className="flex items-center justify-between py-2 px-1">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Mute Aria's voice output
            </span>
            <button
              onClick={() => setMuted(!isMuted)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: isMuted ? 'rgba(236,72,153,0.4)' : 'rgba(168,85,247,0.4)' }}
            >
              <motion.div
                animate={{ x: isMuted ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white"
              />
            </button>
          </div>
        </motion.div>

        {/* AI Memory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={sectionClass}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain size={16} style={{ color: '#a855f7' }} />
              <h2 className="font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
                Aria's Memory
              </h2>
            </div>
            <button
              onClick={clearMemoryHandler}
              className="flex items-center gap-1.5 text-xs transition-colors hover:text-red-400"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <Trash2 size={13} />
              Clear
            </button>
          </div>

          <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            What Aria knows about you — she uses this to personalize every conversation. Edit or clear it anytime.
          </p>

          <textarea
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            rows={5}
            placeholder="Aria hasn't learned much yet — start chatting to build her memory!"
            className="input-primary w-full px-4 py-3 rounded-xl text-sm resize-none"
            style={{ lineHeight: 1.6 }}
          />
        </motion.div>

        {/* Save button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={savePreferences}
          disabled={saving}
          className="btn-primary w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {saving ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Settings
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
