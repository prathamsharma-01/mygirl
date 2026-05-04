'use client';
import { motion } from 'framer-motion';

interface WaveformProps {
  isActive: boolean;
  barCount?: number;
  color?: 'purple' | 'pink' | 'white';
  height?: number;
}

export default function Waveform({
  isActive,
  barCount = 20,
  color = 'purple',
  height = 40,
}: WaveformProps) {
  const bars = Array.from({ length: barCount }, (_, i) => ({
    id: i,
    delay: (i / barCount) * 0.5,
    minH: 4,
    maxH: height * (0.3 + Math.random() * 0.7),
  }));

  const gradients = {
    purple: 'linear-gradient(to top, #7c3aed, #c084fc)',
    pink:   'linear-gradient(to top, #db2777, #f9a8d4)',
    white:  'linear-gradient(to top, rgba(255,255,255,0.4), rgba(255,255,255,0.9))',
  };

  return (
    <div
      className="flex items-center gap-[3px]"
      style={{ height }}
      aria-label={isActive ? 'Waveform active' : 'Waveform idle'}
    >
      {bars.map((bar) => (
        <motion.div
          key={bar.id}
          style={{
            width: 3,
            borderRadius: 2,
            background: gradients[color],
          }}
          animate={
            isActive
              ? {
                  height: [bar.minH, bar.maxH, bar.minH * 1.5, bar.maxH * 0.7, bar.minH],
                  opacity: [0.6, 1, 0.7, 1, 0.6],
                }
              : { height: bar.minH, opacity: 0.25 }
          }
          transition={
            isActive
              ? {
                  duration: 1.2 + Math.random() * 0.8,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay: bar.delay,
                  ease: 'easeInOut',
                }
              : { duration: 0.4 }
          }
        />
      ))}
    </div>
  );
}
