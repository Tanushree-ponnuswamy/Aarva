import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Textbook, StudentDashboardData } from '../types';
import { api } from '../services/api';
import { TextbookManager } from './TextbookManager';
import { SummarizerView } from './SummarizerView';
import { AIChat } from './AIChat';
import { QuizModule } from './QuizModule';
import { ProgressView } from './ProgressView';
import { ChapterJourney } from './ChapterJourney';
import { BottomNav } from './BottomNav';
import confetti from 'canvas-confetti';
import {
  Home, BookOpen, Sparkles, CheckCircle2, TrendingUp,
  Flame, ArrowRight, Play, BookMarked, Zap, Target
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const { user } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [activeBook, setActiveBook] = useState<Textbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [xpToast, setXpToast] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    const data = await api.getStudentDashboard(user?.id || 2);
    setDashboardData(data);
    if (data.textbooks.length > 0) {
      setActiveBook(data.textbooks[0]);
    }
    setLoading(false);
  };

  const handleSelectBook = (book: Textbook) => {
    setActiveBook(book);
    setCurrentTab('summary');
  };

  const triggerXpAward = async (amount: number, reason: string) => {
    await api.awardXp(user?.id || 2, reason, amount);
    setXpToast(`+${amount} XP: ${reason}!`);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setXpToast(null), 3000);
    // Refresh stats
    loadDashboard();
  };

  const handleChapterJourneySelect = (chapterNum: number) => {
    triggerXpAward(50, `Studying Chapter ${chapterNum} Summary`);
    setCurrentTab('summary');
  };

  if (loading || !dashboardData) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Sparkles size={32} color="var(--primary)" style={{ animation: 'bounceDot 1s infinite' }} />
        <div style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600 }}>
          Loading AARVA Learning Space...
        </div>
      </div>
    );
  }

  const effectiveBook = activeBook || dashboardData.textbooks[0];
  const gamification = dashboardData.gamification;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Floating Celebration XP Toast */}
      {xpToast && (
        <div
          className="animate-slide-right"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '24px',
            zIndex: 100,
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 8px 24px var(--primary-glow)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.88rem',
            fontWeight: 800
          }}
        >
          <Zap size={18} fill="#ffffff" />
          <span>{xpToast}</span>
        </div>
      )}

      {/* Desktop/Tablet Horizontal Tab Navigation */}
      <div
        style={{
          height: 'var(--subnav-height)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          flexShrink: 0
        }}
        className="hide-on-mobile"
      >
        <div className="subnav-inner">
          {/* Main Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { id: 'overview', label: 'My Learning Space', icon: Home },
              { id: 'textbooks', label: 'Textbooks', icon: BookOpen },
              { id: 'summary', label: 'Summary & AI Tutor', icon: Sparkles },
              { id: 'quiz', label: 'Adaptive Quiz', icon: CheckCircle2 },
              { id: 'progress', label: 'Progress & Badges', icon: TrendingUp },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Gamified Level & Active Book Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <Zap size={14} fill="var(--primary)" />
              <span>Level {dashboardData.stats.level || 3} · {dashboardData.stats.xp || 240} XP</span>
            </div>

            {dashboardData.textbooks.length > 0 && (
              <select
                value={effectiveBook?.id}
                onChange={e => {
                  const b = dashboardData.textbooks.find(tb => tb.id === Number(e.target.value));
                  if (b) setActiveBook(b);
                }}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  maxWidth: '220px'
                }}
              >
                {dashboardData.textbooks.map(tb => (
                  <option key={tb.id} value={tb.id}>
                    {tb.title.split(':')[0]}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Content Container */}
      <div className="page-content-scroll" style={{ paddingBottom: '5rem' }}>
        <div className="page-inner">
        {/* ================= TAB 1: OVERVIEW & CHAPTER JOURNEY ================= */}
        {currentTab === 'overview' && (
          <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Top Bar matching user prompt: "My Learning Space · 240 XP" */}
            <div
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(37, 99, 235, 0.08) 100%)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    My Learning Space
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '0.74rem',
                      fontWeight: 800
                    }}
                  >
                    <Zap size={13} fill="#ffffff" /> {dashboardData.stats.xp || 240} XP
                  </span>
                </div>

                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  Continue Your Textbook Journey
                </h1>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Active Book: <strong>{effectiveBook.title.split(':')[0]}</strong> · Chapter 3: Packet Switching (60% Progress)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    triggerXpAward(50, "Completed Chapter 3 Summary");
                    setCurrentTab('summary');
                  }}
                  className="gradient-brand-btn touch-target"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 1.4rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  <Play size={16} /> Continue Learning (+50 XP)
                </button>
              </div>
            </div>

            {/* Visual Chapter Learning Path */}
            {gamification?.chapter_journey && (
              <ChapterJourney
                milestones={gamification.chapter_journey}
                onSelectChapter={handleChapterJourneySelect}
              />
            )}

            {/* Quick Stat Cards */}
            <div className="grid-auto-fit">
              {[
                { title: 'Textbooks in Library', val: dashboardData.stats.textbooks_count, icon: BookOpen, color: '#4f46e5' },
                { title: 'Mastered Topics', val: dashboardData.stats.completed_topics, icon: CheckCircle2, color: '#10b981' },
                { title: 'Study Streak', val: `${dashboardData.stats.streak_days} Days`, icon: Flame, color: '#ea580c' },
                { title: 'Average Quiz Accuracy', val: `${dashboardData.stats.avg_quiz_score}%`, icon: TrendingUp, color: '#7c3aed' },
              ].map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={idx}
                    className="glass-panel"
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: `${s.color}15`,
                        color: s.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
                        {s.val}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {s.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: TEXTBOOKS ================= */}
        {currentTab === 'textbooks' && (
          <TextbookManager
            textbooks={dashboardData.textbooks}
            onSelectBook={handleSelectBook}
            onRefresh={loadDashboard}
          />
        )}

        {/* ================= TAB 3: DUAL SUMMARY & AI TUTOR CHAT ================= */}
        {currentTab === 'summary' && (
          <div
            className="animate-fade-in-up dual-panel"
            style={{ minHeight: '600px' }}
          >
            <SummarizerView activeTextbook={effectiveBook} />
            <AIChat activeTextbook={effectiveBook} />
          </div>
        )}

        {/* ================= TAB 4: ADAPTIVE QUIZ ================= */}
        {currentTab === 'quiz' && (
          <QuizModule
            activeTextbook={effectiveBook}
            onCompleted={() => {
              triggerXpAward(70, "Completed Quiz Check");
              loadDashboard();
            }}
          />
        )}

        {/* ================= TAB 5: PROGRESS & ANALYTICS ================= */}
        {currentTab === 'progress' && (
          <ProgressView
            data={dashboardData}
            onContinueLearning={() => setCurrentTab('summary')}
            onReviewConcept={() => setCurrentTab('summary')}
          />
        )}
        </div>
      </div>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
    </div>
  );
};
