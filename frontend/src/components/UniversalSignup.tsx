import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, LANGUAGES } from '../context/ThemeContext';
import { AarvaLogo } from './AarvaLogo';
import {
  BookOpen, MessageSquare, Globe, BarChart3, GraduationCap, Building2,
  Briefcase, User, ShieldCheck, Eye, EyeOff, Check, ArrowRight, ArrowLeft,
  Calendar, Phone, Mail, Lock, Sparkles, Moon, Sun, ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UniversalSignup: React.FC = () => {
  const { signup, login, switchDemoRole } = useAuth();
  const { theme, toggleTheme, language, setLanguage } = useTheme();

  // Mode: 'signup' or 'login'
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

  // Stepper: 1, 2, 3, 4
  const [step, setStep] = useState<number>(1);
  const [learnerType, setLearnerType] = useState<'school' | 'college' | 'professional' | 'independent'>('college');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    gender: '',
    // Dynamic Profile fields
    institution: '',
    department: '',
    year: '3rd Year',
    semester: 'Semester 5',
    board: 'CBSE',
    classGrade: 'Class 11 Science',
    jobRole: '',
    industry: '',
    // Interests
    subjects: ['Computer Networks', 'Operating Systems'],
    goals: ['Score 9.0+ CGPA', 'Crack Tech Interviews'],
    // Preferences
    learningStyles: ['Short summaries', 'Diagrams and visual learning', 'Practice questions'],
    voiceAssistance: true,
    textToSpeech: true,
    speechInput: false,
    largerText: false,
    simplifiedExplanations: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fast pre-fill helper for instant user delight
  const prefillPersona = (type: 'school' | 'college' | 'professional' | 'independent') => {
    setLearnerType(type);
    if (type === 'college') {
      setFormData(prev => ({
        ...prev,
        name: 'Aarav Sharma',
        email: 'aarav.sharma@college.edu',
        password: 'student123',
        institution: 'Indian Institute of Technology, Madras',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        semester: 'Semester 5',
        subjects: ['Data Structures & Algorithms', 'Operating Systems', 'Computer Networks'],
        goals: ['Score 9.0+ CGPA', 'Crack Tech Interviews']
      }));
    } else if (type === 'school') {
      setFormData(prev => ({
        ...prev,
        name: 'Priya Patel',
        email: 'priya.patel@school.edu',
        password: 'student123',
        institution: 'Delhi Public School, R.K. Puram',
        board: 'CBSE',
        classGrade: 'Class 11 Science',
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        goals: ['Clear JEE Advanced', 'Board Exam Top 1%']
      }));
    } else if (type === 'professional') {
      setFormData(prev => ({
        ...prev,
        name: 'Rohan Iyer',
        email: 'rohan.iyer@techcorp.com',
        password: 'student123',
        jobRole: 'Cloud Solutions Architect',
        industry: 'Fintech & Cloud Systems',
        subjects: ['Distributed Systems', 'Kubernetes', 'Generative AI Architecture'],
        goals: ['AWS Solution Architect Pro', 'Scale Microservices']
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        name: 'Maya Sen',
        email: 'maya.sen@learner.net',
        password: 'student123',
        institution: 'Lifelong Learning Institute',
        department: 'Cognitive Science & Philosophy',
        subjects: ['Neurobiology', 'Philosophy of Mind', 'Machine Learning Foundations'],
        goals: ['Personal Curiosity', 'Read 24 Scientific Textbooks']
      }));
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    await signup({
      ...formData,
      learner_type: learnerType,
      preferred_language: language.label
    });
    setIsSubmitting(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(loginEmail || 'aarav.sharma@college.edu', 'student');
    setIsSubmitting(false);
  };

  const toggleSubject = (subj: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subj)
        ? prev.subjects.filter(s => s !== subj)
        : [...prev.subjects, subj]
    }));
  };

  const toggleStyle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      learningStyles: prev.learningStyles.includes(style)
        ? prev.learningStyles.filter(s => s !== style)
        : [...prev.learningStyles, style]
    }));
  };

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1.5rem, 4vh, 3rem) var(--content-pad-x)',
        backgroundImage: theme === 'light'
          ? 'radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.04) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.05) 0%, transparent 40%)'
          : 'radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.12) 0%, transparent 40%)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1300px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 'clamp(1.5rem, 4vw, 3rem)',
          alignItems: 'center'
        }}
      >
        {/* ================= LEFT COLUMN: HERO BRANDING & ILLUSTRATION ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
          {/* Logo */}
          <AarvaLogo size="lg" showSubtitle={true} />

          {/* Punchy Heading */}
          <div>
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                lineHeight: 1.15,
                fontWeight: 800,
                color: 'var(--text-main)'
              }}
            >
              Knowledge <br />
              for a <span className="gradient-text">Brighter You</span>
            </h1>
            <p
              style={{
                marginTop: '1rem',
                fontSize: '1.05rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                maxWidth: '480px'
              }}
            >
              AARVA uses AI to simplify learning for everyone — students, professionals, and lifelong learners.
            </p>
          </div>

          {/* 4 Feature Highlights */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
              maxWidth: '520px'
            }}
          >
            {[
              { label: 'Summarize Textbooks', icon: BookOpen, color: '#4f46e5' },
              { label: 'Chat with AI Tutor', icon: MessageSquare, color: '#2563eb' },
              { label: 'Learn in Your Language', icon: Globe, color: '#06b6d4' },
              { label: 'Track Your Progress', icon: BarChart3, color: '#7c3aed' }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform var(--transition-fast)'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: `${feat.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: feat.color,
                      marginBottom: '0.4rem'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.25 }}>
                    {feat.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 3D Illustration Card matching reference design */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            <img
              src="/aarva_learners.jpg"
              alt="AARVA diverse learners: School Students, College Students, Professionals, and Lifelong Learners"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover'
              }}
            />

            {/* Floating Persona Label Badges */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#4338ca',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              🎒 Students
            </div>
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#065f46',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              💼 Professionals
            </div>
          </div>

          {/* Branding Quote & Handwritten note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '0.5rem 0'
            }}
          >
            <div>
              <p
                style={{
                  fontStyle: 'italic',
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  fontWeight: 600
                }}
              >
                “Learning has no age limit.”
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>— AARVA</span>
            </div>
            <div
              style={{
                fontFamily: 'cursive, var(--font-heading)',
                fontSize: '0.9rem',
                color: 'var(--primary)',
                fontWeight: 700
              }}
            >
              Different Goals · One AARVA ♡
            </div>
          </div>

          {/* Footer Sub-links */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.2rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem'
            }}
          >
            <span style={{ cursor: 'pointer' }}>About</span>
            <span style={{ cursor: 'pointer' }}>Features</span>
            <span style={{ cursor: 'pointer' }}>Privacy</span>
            <span style={{ cursor: 'pointer' }}>Help</span>
            <span style={{ marginLeft: 'auto', fontStyle: 'italic', color: 'var(--text-subtle)' }}>
              A Smarter Tomorrow with AARVA ♡
            </span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: UNIVERSAL DYNAMIC FORM ================= */}
        <div
          className="glass-panel"
          style={{
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
            backgroundColor: 'var(--bg-surface-elevated)',
            position: 'relative'
          }}
        >
          {/* Top Bar: Sign Up / Login Tabs, Dark Mode, Language Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.75rem'
            }}
          >
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <button
                onClick={() => setAuthMode('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: authMode === 'signup' ? 700 : 500,
                  color: authMode === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  position: 'relative',
                  paddingBottom: '0.4rem'
                }}
              >
                Sign Up
                {authMode === 'signup' && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-0.75rem',
                      left: 0,
                      right: 0,
                      height: '2.5px',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </button>

              <button
                onClick={() => setAuthMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: authMode === 'login' ? 700 : 500,
                  color: authMode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  position: 'relative',
                  paddingBottom: '0.4rem'
                }}
              >
                Login
                {authMode === 'login' && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-0.75rem',
                      left: 0,
                      right: 0,
                      height: '2.5px',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </button>
            </div>

            {/* Theme & Language Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={toggleTheme}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  color: 'var(--text-muted)'
                }}
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#fbbf24" />}
              </button>

              {/* Language Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setLangDropdownOpen(prev => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'none',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    color: 'var(--text-main)'
                  }}
                >
                  <Globe size={13} color="var(--primary)" />
                  <span>{language.label}</span>
                  <ChevronDown size={12} />
                </button>

                {langDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '0.3rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '0.3rem',
                      zIndex: 30,
                      width: '130px'
                    }}
                  >
                    {LANGUAGES.map(l => (
                      <div
                        key={l.code}
                        onClick={() => { setLanguage(l); setLangDropdownOpen(false); }}
                        style={{
                          padding: '0.4rem 0.5rem',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: language.code === l.code ? 'var(--primary-light)' : 'transparent',
                          color: language.code === l.code ? 'var(--primary)' : 'var(--text-main)'
                        }}
                      >
                        {l.native}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= MODE: LOGIN ================= */}
          {authMode === 'login' ? (
            <div className="animate-fade-in-up">
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                Welcome back to <span className="gradient-text">AARVA</span>
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Sign in to continue your personalized learning journey.
              </p>

              {/* Quick Demo Fill Buttons */}
              <div
                style={{
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  ⚡ Quick Demo Login:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => { setLoginEmail('aarav.sharma@college.edu'); setLoginPassword('student123'); }}
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.78rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    🎓 College Student
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginEmail('priya.patel@school.edu'); setLoginPassword('student123'); }}
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.78rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    🎒 School Student
                  </button>
                  <button
                    type="button"
                    onClick={() => { switchDemoRole('admin'); }}
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.78rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      backgroundColor: 'rgba(239,68,68,0.08)',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    🛡️ Admin Portal
                  </button>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.4rem 0.75rem 2.4rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-subtle)'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <input type="checkbox" defaultChecked /> Remember me
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Demo password reset instructions sent!"); }} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="gradient-brand-btn touch-target"
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In to AARVA'} <ArrowRight size={18} />
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Don’t have an account?{' '}
                <button
                  onClick={() => setAuthMode('signup')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create one now
                </button>
              </div>
            </div>
          ) : (
            /* ================= MODE: MULTI-STEP SIGNUP ================= */
            <div className="animate-fade-in-up">
              {/* Header Title */}
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                Create Your <span className="gradient-text">AARVA</span> Account
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                A few details help us personalize your learning experience.
              </p>

              {/* 4-Step Animated Progress Stepper */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.75rem',
                  position: 'relative'
                }}
              >
                {[
                  { num: 1, label: 'Basic Info' },
                  { num: 2, label: 'Your Profile' },
                  { num: 3, label: 'Interests & Goals' },
                  { num: 4, label: 'Preferences' }
                ].map((s, idx) => {
                  const isCompleted = step > s.num;
                  const isCurrent = step === s.num;
                  return (
                    <div
                      key={s.num}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 2,
                        cursor: 'pointer'
                      }}
                      onClick={() => s.num < step && setStep(s.num)}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isCurrent ? 'var(--primary)' : (isCompleted ? 'var(--success)' : 'var(--bg-muted)'),
                          color: isCurrent || isCompleted ? '#ffffff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          transition: 'all var(--transition-fast)',
                          boxShadow: isCurrent ? '0 0 12px var(--primary-glow)' : 'none'
                        }}
                      >
                        {isCompleted ? <Check size={16} /> : s.num}
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: isCurrent ? 700 : 500,
                          color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                          marginTop: '0.35rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}

                {/* Connecting Track Line */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    right: '16px',
                    height: '2px',
                    backgroundColor: 'var(--border-subtle)',
                    zIndex: 1
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: 'var(--primary)',
                      width: `${((step - 1) / 3) * 100}%`,
                      transition: 'width var(--transition-normal)'
                    }}
                  />
                </div>
              </div>

              {/* ================= STEP 1: BASIC INFO & WHO ARE YOU ================= */}
              {step === 1 && (
                <div className="animate-slide-right">
                  {/* Persona Selector ("Who are you?") */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                      Who are you?
                    </label>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.65rem'
                      }}
                    >
                      {[
                        { id: 'school', title: 'School Student', sub: 'Class, board, subjects', icon: GraduationCap },
                        { id: 'college', title: 'College Student', sub: 'Degree, department', icon: Building2 },
                        { id: 'professional', title: 'Working Professional', sub: 'Job role, industry', icon: Briefcase },
                        { id: 'independent', title: 'Independent Learner', sub: 'Personal interests', icon: User }
                      ].map(p => {
                        const Icon = p.icon;
                        const isSelected = learnerType === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => prefillPersona(p.id as any)}
                            style={{
                              padding: '0.85rem 0.5rem',
                              borderRadius: 'var(--radius-md)',
                              border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                              backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all var(--transition-fast)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              boxShadow: isSelected ? '0 4px 12px var(--primary-glow)' : 'var(--shadow-sm)'
                            }}
                          >
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-muted)',
                                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.4rem'
                              }}
                            >
                              <Icon size={18} />
                            </div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                              {p.title}
                            </div>
                            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {p.sub}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personal Information Inputs */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                      <User size={16} color="var(--primary)" />
                      Personal Information
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Full Name *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <User size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.65rem 0.65rem 2.2rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-main)',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Email Address *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Mail size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.65rem 0.65rem 2.2rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-main)',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Password *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Lock size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.65rem 2rem 0.65rem 2.2rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-main)',
                              fontSize: '0.85rem'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-subtle)'
                            }}
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Phone Number (optional)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Phone size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.65rem 0.65rem 2.2rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-main)',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Date of Birth (optional)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Calendar size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text"
                            placeholder="DD / MM / YYYY"
                            value={formData.dob}
                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.65rem 0.65rem 2.2rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-main)',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Gender (optional)
                        </label>
                        <select
                          value={formData.gender}
                          onChange={e => setFormData({ ...formData, gender: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-main)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 2: DYNAMIC ADAPTIVE PROFILE ================= */}
              {step === 2 && (
                <div className="animate-slide-right">
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      Adapting for: {learnerType.toUpperCase()}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                      Academic & Professional Details
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      These details allow AARVA to tailor textbook explanations to your syllabus or seniority.
                    </p>
                  </div>

                  {learnerType === 'college' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          College or University Name *
                        </label>
                        <input
                          type="text"
                          value={formData.institution}
                          onChange={e => setFormData({ ...formData, institution: e.target.value })}
                          placeholder="e.g. IIT Madras / Stanford University"
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Degree & Department *
                        </label>
                        <input
                          type="text"
                          value={formData.department}
                          onChange={e => setFormData({ ...formData, department: e.target.value })}
                          placeholder="e.g. B.Tech Computer Science"
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Year & Semester
                        </label>
                        <input
                          type="text"
                          value={formData.year}
                          onChange={e => setFormData({ ...formData, year: e.target.value })}
                          placeholder="3rd Year, Semester 5"
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  )}

                  {learnerType === 'school' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          School Name *
                        </label>
                        <input
                          type="text"
                          value={formData.institution}
                          onChange={e => setFormData({ ...formData, institution: e.target.value })}
                          placeholder="e.g. Delhi Public School / St. Xavier's"
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Education Board *
                        </label>
                        <select
                          value={formData.board}
                          onChange={e => setFormData({ ...formData, board: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                        >
                          <option value="CBSE">CBSE</option>
                          <option value="ICSE">ICSE / ISC</option>
                          <option value="State Board">State Board</option>
                          <option value="IB">International Baccalaureate (IB)</option>
                          <option value="Cambridge">Cambridge IGCSE</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Class / Grade *
                        </label>
                        <select
                          value={formData.classGrade}
                          onChange={e => setFormData({ ...formData, classGrade: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                        >
                          <option value="Class 9">Class 9</option>
                          <option value="Class 10">Class 10</option>
                          <option value="Class 11 Science">Class 11 Science</option>
                          <option value="Class 12 Science">Class 12 Science</option>
                          <option value="Class 11/12 Commerce">Class 11/12 Commerce</option>
                          <option value="Class 11/12 Arts">Class 11/12 Humanities</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {learnerType === 'professional' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Job Role / Title *
                        </label>
                        <input
                          type="text"
                          value={formData.jobRole}
                          onChange={e => setFormData({ ...formData, jobRole: e.target.value })}
                          placeholder="e.g. Solutions Architect / Data Scientist"
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Industry / Domain *
                        </label>
                        <input
                          type="text"
                          value={formData.industry}
                          onChange={e => setFormData({ ...formData, industry: e.target.value })}
                          placeholder="e.g. Cloud & AI Infrastructure / Finance"
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  )}

                  {learnerType === 'independent' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Primary Focus of Self-Study
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Quantum Computing, History of Science, Neurobiology"
                          defaultValue="Artificial Intelligence & Cognitive Science"
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= STEP 3: INTERESTS & GOALS ================= */}
              {step === 3 && (
                <div className="animate-slide-right">
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                    Subjects, Interests & Goals
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Select the key topics you want AARVA to organize and quiz you on.
                  </p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Select Focus Subjects
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {[
                        'Computer Networks', 'Operating Systems', 'Algorithms & Data Structures',
                        'Artificial Intelligence', 'Physics (Mechanics & Electromagnetism)',
                        'Organic Chemistry', 'Calculus & Linear Algebra', 'Distributed Systems'
                      ].map(s => {
                        const active = formData.subjects.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSubject(s)}
                            style={{
                              padding: '0.4rem 0.75rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.78rem',
                              fontWeight: active ? 700 : 500,
                              border: active ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                              backgroundColor: active ? 'var(--primary-light)' : 'var(--bg-surface)',
                              color: active ? 'var(--primary)' : 'var(--text-main)',
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)'
                            }}
                          >
                            {active ? '✓ ' : '+ '} {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Primary Learning Goals
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {[
                        'Score 9.0+ CGPA / Top Grades',
                        'Crack Competitive & Entrance Exams',
                        'Master Complex Systems & Code',
                        'Quick Textbook Revision Before Tests'
                      ].map(g => (
                        <div
                          key={g}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              goals: prev.goals.includes(g) ? prev.goals.filter(item => item !== g) : [...prev.goals, g]
                            }));
                          }}
                          style={{
                            padding: '0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            border: formData.goals.includes(g) ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                            backgroundColor: formData.goals.includes(g) ? 'var(--primary-light)' : 'var(--bg-surface)',
                            fontSize: '0.78rem',
                            fontWeight: formData.goals.includes(g) ? 700 : 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <Check size={14} color={formData.goals.includes(g) ? 'var(--primary)' : 'transparent'} />
                          {g}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 4: LEARNING PREFERENCES ================= */}
              {step === 4 && (
                <div className="animate-slide-right">
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                    Learning Preferences & Accessibility
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Choose how you want AARVA’s AI models to summarize and explain textbook concepts.
                  </p>

                  {/* Preferred Learning Style */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Preferred Learning Style
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {[
                        'Short summaries',
                        'Detailed explanations',
                        'Examples and real-world applications',
                        'Diagrams and visual learning',
                        'Practice questions',
                        'Step-by-step solutions'
                      ].map(ls => {
                        const active = formData.learningStyles.includes(ls);
                        return (
                          <div
                            key={ls}
                            onClick={() => toggleStyle(ls)}
                            style={{
                              padding: '0.6rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              border: active ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                              backgroundColor: active ? 'var(--primary-light)' : 'var(--bg-surface)',
                              fontSize: '0.78rem',
                              fontWeight: active ? 700 : 500,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <div
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '4px',
                                border: '1px solid var(--primary)',
                                backgroundColor: active ? 'var(--primary)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {active && <Check size={12} color="#fff" />}
                            </div>
                            <span>{ls}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Learning Support & Voice Preferences */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Learning Support & Voice Assistance (optional)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {[
                        { key: 'voiceAssistance', label: 'Voice assistance' },
                        { key: 'textToSpeech', label: 'Text-to-speech' },
                        { key: 'speechInput', label: 'Speech input' },
                        { key: 'largerText', label: 'Larger text' },
                        { key: 'simplifiedExplanations', label: 'Simplified explanations' }
                      ].map(opt => {
                        const isChecked = (formData as any)[opt.key];
                        return (
                          <label
                            key={opt.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              padding: '0.45rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-surface)',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => setFormData({ ...formData, [opt.key]: e.target.checked })}
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons: Back & Continue */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '1.5rem' }}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(prev => prev - 1)}
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="gradient-brand-btn touch-target"
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isSubmitting
                    ? 'Creating Account...'
                    : (step === 4 ? 'Complete Sign Up & Enter AARVA ✨' : 'Continue →')}
                </button>
              </div>

              {/* Switch to Login Link */}
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Login
                </button>
              </div>

              {/* Trust Badge / Privacy Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  marginTop: '1.25rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  border: '1px solid rgba(79, 70, 229, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0
                    }}
                  >
                    <ShieldCheck size={17} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Your data is safe with us
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      We respect your privacy and use your information only to personalize your learning experience.
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                  AARVA ♡
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
