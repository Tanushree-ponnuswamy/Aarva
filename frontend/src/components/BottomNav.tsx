import React from 'react';
import { Home, BookOpen, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'textbooks', label: 'Textbooks', icon: BookOpen },
    { id: 'summary', label: 'Summary & AI', icon: Sparkles },
    { id: 'quiz', label: 'Quiz', icon: CheckCircle2 },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.4rem 0.5rem 0.6rem',
        boxShadow: '0 -4px 15px rgba(0,0,0,0.05)'
      }}
      className="show-on-mobile-only"
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '0.35rem 0.6rem',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              position: 'relative'
            }}
          >
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  width: '18px',
                  height: '3px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--primary)'
                }}
              />
            )}
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span style={{ fontSize: '0.68rem', fontWeight: isActive ? 700 : 500 }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
