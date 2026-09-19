import React from 'react';
import { ConceptMasteryItem } from '../types';
import { CheckCircle2, Clock, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

interface ConceptMasteryProps {
  concepts: ConceptMasteryItem[];
  onReviewConcept: (conceptName: string) => void;
}

export const ConceptMasteryGrid: React.FC<ConceptMasteryProps> = ({ concepts, onReviewConcept }) => {
  return (
    <div
      className="glass-panel animate-fade-in-up"
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles size={14} /> Cognitive Retention
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Concept Mastery & Spaced Revision
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Track which syllabus concepts you have mastered and which need periodic reinforcement.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem'
        }}
      >
        {concepts.map((c, idx) => {
          const isMastered = c.status === 'mastered';
          const isLearning = c.status === 'learning';
          const needsReview = c.status === 'needs_review';

          const color = isMastered ? '#10b981' : (isLearning ? 'var(--primary)' : '#f59e0b');
          const bgColor = isMastered ? 'rgba(16, 185, 129, 0.08)' : (isLearning ? 'var(--primary-light)' : 'rgba(245, 158, 11, 0.08)');
          const Icon = isMastered ? CheckCircle2 : (isLearning ? Clock : AlertCircle);

          return (
            <div
              key={idx}
              style={{
                padding: '1.15rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface)',
                border: `1.5px solid ${color}40`,
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform var(--transition-fast)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: bgColor,
                      color: color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Icon size={12} />
                    {c.status.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color }}>
                    {c.mastery_pct}%
                  </span>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem', lineHeight: 1.3 }}>
                  {c.concept}
                </h4>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Last tested: {c.last_reviewed}
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => onReviewConcept(c.concept)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-main)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <BookOpen size={13} />
                  {needsReview ? 'Review Summary (+25 XP)' : 'Open Concept'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
