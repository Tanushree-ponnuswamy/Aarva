/**
 * AIAvatar — Animated AI character used across AARVA wherever Llama is active.
 *
 * Variants:
 *  "idle"     — gentle float + soft glow pulse (header / empty states)
 *  "thinking" — spinning orbit rings + core pulse (loading / typing)
 *  "speaking" — sound-wave bars animate up/down (TTS active)
 *  "success"  — quick scale-bounce then settle to idle (response received)
 *
 * Sizes: "xs" (20px)  "sm" (32px)  "md" (48px)  "lg" (72px)  "xl" (100px)
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AIAvatarVariant = 'idle' | 'thinking' | 'speaking' | 'success';
export type AIAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AIAvatarProps {
  variant?: AIAvatarVariant;
  size?: AIAvatarSize;
  /** Show the pulsing halo ring behind the avatar */
  halo?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP: Record<AIAvatarSize, number> = {
  xs: 20, sm: 32, md: 48, lg: 72, xl: 100,
};

// ── Brain / neural SVG paths rendered inside the circle ──────────────────────
const BrainIcon: React.FC<{ px: number }> = ({ px }) => {
  const s = px * 0.52;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* left hemisphere */}
      <path
        d="M12 3C9.5 3 7 5 7 8c0 1.5.6 2.8 1.5 3.8C7.2 12.6 6 14.2 6 16c0 2.8 2.5 5 5.5 5"
        stroke="white" strokeWidth="1.6" strokeLinecap="round"
      />
      {/* right hemisphere */}
      <path
        d="M12 3c2.5 0 5 2 5 5 0 1.5-.6 2.8-1.5 3.8C16.8 12.6 18 14.2 18 16c0 2.8-2.5 5-5.5 5"
        stroke="white" strokeWidth="1.6" strokeLinecap="round"
      />
      {/* center spine */}
      <line x1="12" y1="5" x2="12" y2="20" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
      {/* neural nodes */}
      <circle cx="9" cy="9" r="1" fill="white" opacity=".85" />
      <circle cx="15" cy="9" r="1" fill="white" opacity=".85" />
      <circle cx="8" cy="14" r="1" fill="white" opacity=".7" />
      <circle cx="16" cy="14" r="1" fill="white" opacity=".7" />
    </svg>
  );
};

// ── Sound-wave bars for "speaking" variant ────────────────────────────────────
const SpeakingBars: React.FC<{ px: number }> = ({ px }) => {
  const barW = Math.max(2, px * 0.06);
  const heights = [0.22, 0.45, 0.65, 0.45, 0.22];
  const delays  = [0, 0.1, 0.2, 0.1, 0];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: barW, height: px * 0.5 }}>
      {heights.map((h, i) => (
        <motion.div
          key={i}
          animate={{ scaleY: [1, 2.8, 1] }}
          transition={{ duration: 0.55, repeat: Infinity, delay: delays[i], ease: 'easeInOut' }}
          style={{
            width: barW,
            height: px * h,
            backgroundColor: 'white',
            borderRadius: barW,
            originY: 0.5,
          }}
        />
      ))}
    </div>
  );
};

// ── Orbit ring for "thinking" variant ─────────────────────────────────────────
const OrbitRing: React.FC<{ px: number; delay: number; reverse?: boolean }> = ({ px, delay, reverse }) => (
  <motion.div
    animate={{ rotate: reverse ? -360 : 360 }}
    transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', delay }}
    style={{
      position: 'absolute',
      inset: -px * 0.18,
      borderRadius: '50%',
      border: `${Math.max(1, px * 0.04)}px dashed rgba(255,255,255,0.35)`,
    }}
  >
    {/* dot on the ring */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: Math.max(3, px * 0.1),
      height: Math.max(3, px * 0.1),
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.9)',
      boxShadow: '0 0 6px rgba(255,255,255,0.8)',
    }} />
  </motion.div>
);

// ── Main component ────────────────────────────────────────────────────────────
export const AIAvatar: React.FC<AIAvatarProps> = ({
  variant = 'idle',
  size    = 'md',
  halo    = false,
  className,
  style,
}) => {
  const px = SIZE_MAP[size];

  // core circle motion per variant
  const coreMotion = {
    idle: {
      animate:    { y: [0, -px * 0.1, 0] },
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
    },
    thinking: {
      animate:    { scale: [1, 1.08, 1] },
      transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' as const },
    },
    speaking: {
      animate:    { scale: [1, 1.04, 1] },
      transition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' as const },
    },
    success: {
      animate:    { scale: [1, 1.25, 0.95, 1.05, 1] },
      transition: { duration: 0.6, ease: 'easeInOut' as const },
    },
  }[variant];

  // glow pulse
  const glowMotion = {
    idle:     { animate: { opacity: [0.35, 0.65, 0.35], scale: [1, 1.12, 1] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const } },
    thinking: { animate: { opacity: [0.5, 0.9, 0.5],  scale: [1, 1.2, 1]  }, transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' as const } },
    speaking: { animate: { opacity: [0.4, 0.8, 0.4],  scale: [1, 1.15, 1] }, transition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' as const } },
    success:  { animate: { opacity: [0.8, 0],         scale: [1, 1.4]      }, transition: { duration: 0.6, ease: 'easeOut' as const } },
  }[variant];

  const gradient = variant === 'speaking'
    ? 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)'
    : variant === 'thinking'
      ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
      : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)';

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: px,
        height: px,
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Halo glow ring */}
      {halo && (
        <motion.div
          {...glowMotion}
          style={{
            position: 'absolute',
            inset: -px * 0.22,
            borderRadius: '50%',
            background: variant === 'speaking'
              ? 'radial-gradient(circle, rgba(6,182,212,0.28) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Orbit rings — only in thinking mode */}
      {variant === 'thinking' && (
        <>
          <OrbitRing px={px} delay={0} />
          <OrbitRing px={px} delay={0.8} reverse />
        </>
      )}

      {/* Core circle */}
      <motion.div
        {...coreMotion}
        style={{
          width: px,
          height: px,
          borderRadius: '50%',
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: variant === 'speaking'
            ? `0 0 ${px * 0.35}px rgba(6,182,212,0.5)`
            : `0 0 ${px * 0.3}px rgba(99,102,241,0.45)`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">
          {variant === 'speaking' ? (
            <motion.div
              key="bars"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
            >
              <SpeakingBars px={px} />
            </motion.div>
          ) : variant === 'thinking' ? (
            <motion.div
              key="spin"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' as const }}
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <BrainIcon px={px} />
            </motion.div>
          ) : (
            <motion.div
              key="brain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <BrainIcon px={px} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
