'use client';
import { motion } from 'framer-motion';

interface AvatarProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  size?: number;
  showRings?: boolean;
}

export default function AvatarOrb({
  isSpeaking = false,
  isListening = false,
  size = 120,
  showRings = true,
}: AvatarProps) {
  const isActive = isSpeaking || isListening;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size + 80, height: size + 80 }}>
      {/* Outer ring — listening */}
      {showRings && isListening && (
        <>
          <motion.div
            className="absolute rounded-full border border-purple-400/30"
            style={{ width: size + 60, height: size + 60 }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute rounded-full border border-purple-500/20"
            style={{ width: size + 40, height: size + 40 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: 'easeOut' }}
          />
        </>
      )}

      {/* Speaking rings */}
      {showRings && isSpeaking && (
        <>
          <motion.div
            className="absolute rounded-full border border-pink-500/30"
            style={{ width: size + 60, height: size + 60 }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute rounded-full border border-purple-400/25"
            style={{ width: size + 40, height: size + 40 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.3, ease: 'easeOut' }}
          />
        </>
      )}

      {/* Orbit ring */}
      {showRings && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size + 30,
            height: size + 30,
            border: '1px solid',
            borderColor: isActive ? 'rgba(168,85,247,0.4)' : 'rgba(168,85,247,0.15)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          {/* Orbit dot */}
          <div
            className="absolute rounded-full"
            style={{
              width: 8,
              height: 8,
              top: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              background: isActive ? '#a855f7' : 'rgba(168,85,247,0.4)',
              boxShadow: isActive ? '0 0 10px #a855f7' : 'none',
            }}
          />
        </motion.div>
      )}

      {/* Main avatar circle */}
      <motion.div
        className="relative flex items-center justify-center rounded-full z-10"
        style={{
          width: size,
          height: size,
          background: isSpeaking
            ? 'linear-gradient(135deg, #7c3aed, #db2777, #9333ea)'
            : isListening
            ? 'linear-gradient(135deg, #7c3aed, #4f46e5, #a855f7)'
            : 'linear-gradient(135deg, #1e1b4b, #2d1b69, #1e1038)',
          boxShadow: isSpeaking
            ? '0 0 40px rgba(219,39,119,0.5), 0 0 80px rgba(168,85,247,0.3)'
            : isListening
            ? '0 0 35px rgba(124,58,237,0.5), 0 0 70px rgba(124,58,237,0.25)'
            : '0 0 25px rgba(124,58,237,0.25), 0 0 50px rgba(124,58,237,0.1)',
        }}
        animate={
          isActive
            ? { scale: [1, 1.04, 1] }
            : { scale: 1 }
        }
        transition={
          isActive
            ? { duration: isSpeaking ? 0.8 : 1.5, repeat: Infinity, ease: 'easeInOut' }
            : {}
        }
      >
        {/* Inner glow */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15) 0%, transparent 60%)',
          }}
        />

        {/* AI Icon / Face */}
        <div className="relative z-10 text-center">
          {isSpeaking ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                <path d="M12 20 Q20 10 28 20 Q20 30 12 20" fill="rgba(255,255,255,0.8)"/>
                <circle cx="15" cy="18" r="2" fill="white" opacity="0.9"/>
                <circle cx="25" cy="18" r="2" fill="white" opacity="0.9"/>
              </svg>
            </motion.div>
          ) : isListening ? (
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                <circle cx="15" cy="18" r="2.5" fill="white" opacity="0.9"/>
                <circle cx="25" cy="18" r="2.5" fill="white" opacity="0.9"/>
                <path d="M14 25 Q20 29 26 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
              </svg>
            </motion.div>
          ) : (
            <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <circle cx="15" cy="17" r="2" fill="rgba(255,255,255,0.7)"/>
              <circle cx="25" cy="17" r="2" fill="rgba(255,255,255,0.7)"/>
              <path d="M14 24 Q20 28 26 24" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M20 4 L20 8 M20 32 L20 36 M4 20 L8 20 M32 20 L36 20" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </div>

        {/* Aria text */}
        <div
          className="absolute bottom-2 text-center"
          style={{ fontSize: size * 0.13, color: 'rgba(255,255,255,0.6)', fontFamily: 'Syne, sans-serif', letterSpacing: '0.1em' }}
        >
          ARIA
        </div>
      </motion.div>
    </div>
  );
}
