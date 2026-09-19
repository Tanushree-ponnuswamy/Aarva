import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizSubmissionResult, Textbook } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, Clock, HelpCircle, Sparkles } from 'lucide-react';

interface QuizModuleProps {
  activeTextbook: Textbook;
  onCompleted?: () => void;
}

export const QuizModule: React.FC<QuizModuleProps> = ({ activeTextbook, onCompleted }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<boolean>(false);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);

  useEffect(() => {
    loadQuiz();
  }, [activeTextbook.id]);

  useEffect(() => {
    if (result) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const loadQuiz = async () => {
    setLoading(true);
    setResult(null);
    setSelectedAnswers({});
    setRevealed(false);
    setCurrentIndex(0);
    setSecondsRemaining(300);

    const data = await api.getQuiz(activeTextbook.id);
    setQuestions(data.questions);
    setLoading(false);
  };

  const handleSelectOption = (optIndex: number) => {
    if (revealed) return;
    const currentQ = questions[currentIndex];
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: optIndex }));
    setRevealed(true);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setRevealed(false);
    } else {
      // Calculate submission
      const answerPayload = questions.map(q => ({
        question_id: q.id,
        selected_option: selectedAnswers[q.id],
        is_correct: selectedAnswers[q.id] === q.correct_option
      }));

      const res = await api.submitQuiz(
        2,
        activeTextbook.id,
        'Core Networking & Transport Protocols',
        answerPayload
      );

      setResult(res);
      if (res.passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      if (onCompleted) onCompleted();
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Sparkles size={28} color="var(--primary)" style={{ animation: 'bounceDot 1s infinite' }} />
        <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
          Generating adaptive questions from {activeTextbook.title}...
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className="glass-panel animate-fade-in-up"
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        maxWidth: '820px',
        margin: '0 auto',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-subtle)'
      }}
    >
      {/* ================= COMPLETED RESULT VIEW ================= */}
      {result ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }} className="animate-fade-in-up">
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--radius-full)',
              background: result.passed
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 1.25rem',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <Award size={36} />
          </div>

          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            {result.passed ? 'Great Job! Quiz Completed 🎉' : 'Quiz Review Needed 📚'}
          </h3>

          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              color: result.passed ? 'var(--success)' : 'var(--warning)',
              marginBottom: '0.5rem'
            }}
          >
            {result.percentage}%
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            {result.feedback}
          </p>

          {result.new_badge_unlocked && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.2rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(234, 179, 8, 0.15)',
                color: '#b45309',
                fontWeight: 700,
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(234, 179, 8, 0.3)'
              }}
            >
              <Sparkles size={16} /> New Badge Unlocked: {result.new_badge_unlocked}!
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={loadQuiz}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <RotateCcw size={16} /> Retake Quiz
            </button>
          </div>
        </div>
      ) : (
        /* ================= ACTIVE QUESTION VIEW ================= */
        <div>
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.85rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                {activeTextbook.title.split(':')[0]} Practice Quiz
              </h4>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: secondsRemaining < 60 ? 'var(--danger)' : 'var(--text-muted)'
              }}
            >
              <Clock size={16} />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          </div>

          {/* Question Text */}
          <div style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.5, marginBottom: '1.5rem' }}>
            {currentQ.question}
          </div>

          {/* Options Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;
              const isCorrect = currentQ.correct_option === idx;

              let borderColor = 'var(--border-subtle)';
              let bgColor = 'var(--bg-surface)';
              let textColor = 'var(--text-main)';

              if (revealed) {
                if (isCorrect) {
                  borderColor = 'var(--success)';
                  bgColor = 'var(--success-bg)';
                  textColor = 'var(--success)';
                } else if (isSelected && !isCorrect) {
                  borderColor = 'var(--danger)';
                  bgColor = 'var(--danger-bg)';
                  textColor = 'var(--danger)';
                }
              } else if (isSelected) {
                borderColor = 'var(--primary)';
                bgColor = 'var(--primary-light)';
              }

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${borderColor}`,
                    backgroundColor: bgColor,
                    color: textColor,
                    cursor: revealed ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.92rem',
                    fontWeight: isSelected || (revealed && isCorrect) ? 700 : 500,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid currentColor',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {revealed && isCorrect && <CheckCircle2 size={20} color="var(--success)" />}
                  {revealed && isSelected && !isCorrect && <XCircle size={20} color="var(--danger)" />}
                </div>
              );
            })}
          </div>

          {/* Explanation Banner when answered */}
          {revealed && (
            <div
              className="animate-slide-right"
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                lineHeight: 1.5
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem' }}>
                💡 Pedagogical Explanation:
              </div>
              <div style={{ color: 'var(--text-main)' }}>
                {currentQ.explanation}
              </div>
            </div>
          )}

          {/* Next Button */}
          {revealed && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleNext}
                className="gradient-brand-btn touch-target"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz & View Score'}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
