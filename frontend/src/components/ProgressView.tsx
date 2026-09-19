import React, { useState } from 'react';
import { StudentDashboardData } from '../types';
import { ConceptMasteryGrid } from './ConceptMasteryGrid';
import { Flame, Award, TrendingUp, Target, BookOpen, Clock, CheckCircle, Sparkles, ArrowRight, Zap, Shield } from 'lucide-react';

interface ProgressViewProps {
  data: StudentDashboardData;
  onContinueLearning: () => void;
  onReviewConcept?: (concept: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ data, onContinueLearning, onReviewConcept }) => {
  const gamification = data.gamification;
  const xp = gamification?.xp || data.stats.xp || 240;
  const level = gamification?.level || data.stats.level || 3;
  const levelTitle = gamification?.level_title || data.stats.level_title || "Architecture Scholar";
  const nextLevelXp = gamification?.next_level_xp || data.stats.next_level_xp || 500;
  const nextAch = gamification?.next_achievement;

  const xpProgress = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Level & XP Hero Banner */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(124, 58, 237, 0.08) 100%)',
          border: '1px solid rgba(79, 70, 229, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                letterSpacing: '0.05em'
              }}
            >
              Level {level} · {levelTitle}
            </span>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {data.student.name.split(' ')[0]}’s Learning Journey
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Meaningful progress through textbook summarization, concept reviews, and knowledge checks.
          </p>

          {/* XP Progress Bar to Next Level */}
          <div style={{ marginTop: '1.25rem', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Zap size={14} fill="var(--primary)" /> {xp} XP Total
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {nextLevelXp - xp} XP to Level {level + 1}
              </span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-muted)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${xpProgress}%`,
                  background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                  borderRadius: '4px',
                  transition: 'width 600ms ease-out'
                }}
              />
            </div>
          </div>
        </div>

        {/* Streak Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(234, 88, 12, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c'
            }}
          >
            <Flame size={28} fill="#ea580c" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {data.stats.streak_days} Days
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Daily Study Streak
            </div>
          </div>
        </div>
      </div>

      {/* Next Achievement Card */}
      {nextAch && (
        <div
          className="glass-panel"
          style={{
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1.5rem',
            border: '1.5px dashed var(--primary)',
            backgroundColor: 'rgba(79, 70, 229, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                flexShrink: 0
              }}
            >
              <Target size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
                Next Achievement Goal
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {nextAch.title} · <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{nextAch.requirement}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
              +{nextAch.reward_xp} XP Reward
            </span>
            <button
              onClick={onContinueLearning}
              className="gradient-brand-btn touch-target"
              style={{
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              Progress Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Spaced Concept Mastery Grid */}
      {gamification?.concept_mastery && (
        <ConceptMasteryGrid
          concepts={gamification.concept_mastery}
          onReviewConcept={onReviewConcept || onContinueLearning}
        />
      )}

      {/* Badges & Milestones Showcase */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Award size={22} color="var(--primary)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            Curriculum Achievement Badges
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}
        >
          {data.badges.map((b) => (
            <div
              key={b.id}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: b.unlocked ? 'var(--bg-surface)' : 'var(--bg-muted)',
                border: b.unlocked ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid var(--border-subtle)',
                opacity: b.unlocked ? 1 : 0.65,
                boxShadow: b.unlocked ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                transition: 'transform var(--transition-fast)'
              }}
            >
              <div
                style={{
                  fontSize: '1.8rem',
                  lineHeight: 1,
                  filter: b.unlocked ? 'none' : 'grayscale(100%)'
                }}
              >
                {b.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  {b.title}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                  {b.description}
                </div>
                <div style={{ marginTop: '0.4rem', fontSize: '0.68rem', fontWeight: 700, color: b.unlocked ? '#10b981' : 'var(--text-subtle)' }}>
                  {b.unlocked ? '✓ Unlocked' : '🔒 Locked'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
