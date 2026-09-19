import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const AarvaLogo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSizes = {
    sm: 32,
    md: 44,
    lg: 56
  };

  const titleSizes = {
    sm: '1.25rem',
    md: '1.75rem',
    lg: '2.3rem'
  };

  const subtitleSizes = {
    sm: '0.7rem',
    md: '0.8rem',
    lg: '0.95rem'
  };

  const iconDim = iconSizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size === 'sm' ? '8px' : '12px' }}>
      {/* Dynamic Gradient SVG Icon */}
      <svg
        width={iconDim}
        height={iconDim}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="aarvaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="60%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="aarvaGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7c3aed" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Book Left Page */}
        <path
          d="M 16 72 C 28 66 40 67 48 74 L 48 28 C 40 22 26 21 16 26 Z"
          fill="url(#aarvaGrad1)"
          filter="url(#glow)"
        />
        {/* Book Right Page */}
        <path
          d="M 84 72 C 72 66 60 67 52 74 L 52 28 C 60 22 74 21 84 26 Z"
          fill="url(#aarvaGrad2)"
          filter="url(#glow)"
        />
        {/* Inner Curved Spine / Page Folds */}
        <path
          d="M 48 74 C 44 68 34 68 22 72 L 24 30 C 34 26 44 26 48 30 Z"
          fill="#ffffff"
          fillOpacity="0.25"
        />
        <path
          d="M 52 74 C 56 68 66 68 78 72 L 76 30 C 66 26 56 26 52 30 Z"
          fill="#ffffff"
          fillOpacity="0.35"
        />

        {/* Sparkles / Knowledge Stars above book */}
        <path
          d="M 50 8 L 52 14 L 58 16 L 52 18 L 50 24 L 48 18 L 42 16 L 48 14 Z"
          fill="#7c3aed"
        />
        <circle cx="34" cy="14" r="2.5" fill="#4f46e5" />
        <circle cx="66" cy="14" r="2.5" fill="#06b6d4" />
        <circle cx="25" cy="22" r="1.8" fill="#818cf8" />
        <circle cx="75" cy="22" r="1.8" fill="#a78bfa" />
      </svg>

      {/* Brand Typography */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: titleSizes[size],
            fontWeight: 800,
            letterSpacing: '0.04em',
            lineHeight: 1.1,
            display: 'flex',
            alignItems: 'baseline',
            gap: '2px'
          }}
        >
          <span style={{ color: '#1e1b4b', fontWeight: 900 }}>AAR</span>
          <span
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            VA
          </span>
        </div>
        {showSubtitle && (
          <div
            style={{
              fontSize: subtitleSizes[size],
              color: 'var(--text-muted)',
              fontWeight: 500,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap'
            }}
          >
            Learn Smarter. Grow Further.
          </div>
        )}
      </div>
    </div>
  );
};
