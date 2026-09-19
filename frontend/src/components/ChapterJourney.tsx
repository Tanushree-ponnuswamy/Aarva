import React from 'react';
import { ChapterJourneyMilestone } from '../types';
import { Check, Play, Lock, Sparkles, BookOpen, ArrowRight, Award } from 'lucide-react';

interface ChapterJourneyProps {
  milestones: ChapterJourneyMilestone[];
  onSelectChapter: (chapterNum: number) => void;
}

export const ChapterJourney: React.FC<ChapterJourneyProps> = ({ milestones, onSelectChapter }) => {
  return (
    <div
      className="glass-panel animate-fade-in-up"
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.75rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles size={14} /> Textbook Learning Path
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Your Chapter Milestones
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Chapters become learning stages. Gain +50 XP for completing summaries and checking understanding.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            color: 'var(--primary)',
            fontSize: '0.78rem',
            fontWeight: 700
          }}
        >
          <Award size={15} />
          <span>+50 XP per completed chapter</span>
        </div>
      </div>

      {/* Visual Connected Milestone Roadmap */}
      <div style={{ position: 'relative', paddingLeft: '1.5rem', paddingRight: '1rem' }}>
        {/* Animated Connecting Track Line */}
        <div
          style={{
            position: 'absolute',
            left: '2.55rem',
            top: '24px',
            bottom: '36px',
            width: '3px',
            background: 'linear-gradient(to bottom, #10b981 0%, #4f46e5 60%, var(--border-subtle) 100%)',
            zIndex: 1,
            borderRadius: '3px'
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
          {milestones.map((m, idx) => {
            const isCompleted = m.status === 'completed';
            const isInProgress = m.status === 'in_progress';
            const isUpcoming = m.status === 'upcoming';

            return (
              <div
                key={m.chapter_num}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.25rem'
                }}
              >
                {/* Milestone Node Icon */}
                <div
                  onClick={() => !isUpcoming && onSelectChapter(m.chapter_num)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isCompleted
                      ? '#10b981'
                      : (isInProgress ? 'var(--primary)' : 'var(--bg-surface)'),
                    color: isUpcoming ? 'var(--text-muted)' : '#ffffff',
                    border: isUpcoming ? '2px dashed var(--border-subtle)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isCompleted
                      ? '0 0 14px rgba(16, 185, 129, 0.45)'
                      : (isInProgress ? '0 0 14px var(--primary-glow)' : 'none'),
                    cursor: isUpcoming ? 'default' : 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {isCompleted && <Check size={20} strokeWidth={2.5} />}
                  {isInProgress && <Play size={17} fill="#ffffff" />}
                  {isUpcoming && <Lock size={16} />}
                </div>

                {/* Milestone Card */}
                <div
                  onClick={() => !isUpcoming && onSelectChapter(m.chapter_num)}
                  style={{
                    flex: 1,
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: isInProgress
                      ? 'var(--bg-surface)'
                      : (isCompleted ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)'),
                    border: isInProgress
                      ? '1.5px solid var(--primary)'
                      : (isCompleted ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)'),
                    boxShadow: isInProgress ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    cursor: isUpcoming ? 'default' : 'pointer',
                    transition: 'transform var(--transition-fast), border-color var(--transition-fast)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: isCompleted ? '#10b981' : (isInProgress ? 'var(--primary)' : 'var(--text-muted)')
                        }}
                      >
                        Chapter {m.chapter_num} · {m.pages}
                      </span>
                      {isCompleted && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                          +50 XP
                        </span>
                      )}
                      {isInProgress && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                          In Progress ({m.progress_pct || 60}%)
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: isUpcoming ? 'var(--text-muted)' : 'var(--text-main)' }}>
                      {m.title}
                    </h4>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span>{m.summary_completed ? '✓ Summary Complete' : '○ Summary Pending'}</span>
                      <span>{m.quiz_completed ? '✓ Quiz Verified' : '○ Quiz Check'}</span>
                    </div>
                  </div>

                  <div>
                    {isCompleted && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        Completed ✓
                      </span>
                    )}
                    {isInProgress && (
                      <button
                        className="gradient-brand-btn touch-target"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.55rem 0.95rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Continue <ArrowRight size={14} />
                      </button>
                    )}
                    {isUpcoming && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Next Milestone
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
