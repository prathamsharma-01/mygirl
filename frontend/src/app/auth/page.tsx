'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Particles from '@/components/ui/Particles';
import { apiLogin, apiRegister } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) router.push('/chat');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (mode === 'register' && !form.name) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const data =
        mode === 'login'
          ? await apiLogin(form.email, form.password)
          : await apiRegister(form.email, form.password, form.name);

      setAuth(data.user, data.token);
      toast.success(mode === 'login' ? 'Welcome back! 💜' : 'Welcome to Aria! ✨');
      router.push('/chat');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'input-primary w-full px-4 py-3 rounded-xl text-sm pl-11';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <Particles count={20} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back */}
        <Link
          href="/"
          className="flex items-center gap-2 mb-6 text-sm transition-colors"
          style={{ color: 'rgba(248,250,252,0.5)' }}
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>

        {/* Card */}
        <div className="glass p-8 rounded-3xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-3"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                boxShadow: '0 0 25px rgba(168,85,247,0.4)',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              A
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {mode === 'login' ? 'Welcome back' : 'Meet Aria'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(248,250,252,0.5)' }}>
              {mode === 'login'
                ? "Aria's been waiting for you 💜"
                : 'Create your account to get started'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={
                  mode === m
                    ? {
                        background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                        color: 'white',
                        boxShadow: '0 0 15px rgba(124,58,237,0.3)',
                      }
                    : { color: 'rgba(248,250,252,0.5)' }
                }
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  />
                  <input
                    type="text"
                    placeholder="Your name"
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              />
              <input
                type="email"
                placeholder="Email address"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className={`${inputClass} pr-11`}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl font-semibold text-sm mt-2 relative overflow-hidden"
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span>
                  {mode === 'login' ? 'Sign In 💜' : 'Create Account ✨'}
                </span>
              )}
            </motion.button>
          </form>

          {/* Guest */}
          <div className="mt-5 text-center">
            <p className="text-xs" style={{ color: 'rgba(248,250,252,0.35)' }}>
              Just exploring?{' '}
              <Link href="/chat" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                Try as guest
              </Link>
            </p>
          </div>
        </div>

        {/* Subtle glow */}
        <div
          className="absolute -inset-6 rounded-3xl -z-10"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
        />
      </motion.div>
    </div>
  );
}
