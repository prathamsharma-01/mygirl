'use client';
import { useEffect, useState } from 'react';

interface ParticlesProps {
  count?: number;
}

export default function Particles({ count = 30 }: ParticlesProps) {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate particles ONLY on the client
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: Math.random() * 20 + 15,
      opacity: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? '#a855f7' : '#ec4899',
    }));
    setParticles(generated);
    setMounted(true);
  }, [count]);

  // Don't render random elements on the server to avoid hydration mismatch
  if (!mounted) return <div className="fixed inset-0 pointer-events-none z-0" />;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: '-10px',
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Static ambient orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600,
          height: 600,
          top: '10%',
          left: '5%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500,
          height: 500,
          bottom: '10%',
          right: '5%',
          background: 'radial-gradient(circle, rgba(219,39,119,0.05) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
