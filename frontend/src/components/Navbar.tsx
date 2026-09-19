import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme, LANGUAGES, LanguageOption } from '../context/ThemeContext';
import { AarvaLogo } from './AarvaLogo';
import {
  Moon, Sun, Volume2, VolumeX, Globe, ChevronDown,
  LogOut, ShieldCheck, UserCircle, Sparkles, Flame, Check, X, Menu,
} from 'lucide-react';

// ─── Animation Variants ─────────────────────────────────────────────────────

const EASE_SPRING  = [0.16, 1, 0.3, 1]  as const;
const EASE_OUT     = [0.4, 0, 0.2, 1]   as const;

const drawerVariants = {
  hidden:   { x: '100%', opacity: 0 },
  visible:  { x: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 320, damping: 32 } },
  exit:     { x: '100%', opacity: 0, transition: { duration: 0.22, ease: EASE_OUT } },
};

const overlayVariants = {
  hidden:   { opacity: 0 },
  visible:  { opacity: 1, transition: { duration: 0.2 } },
  exit:     { opacity: 0, transition: { duration: 0.22 } },
};

const dropdownVariants = {
  hidden:   { opacity: 0, y: -6, scale: 0.97 },
  visible:  { opacity: 1, y: 0, scale: 1,   transition: { duration: 0.18, ease: EASE_SPRING } },
  exit:     { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.14 } },
};

const hamburgerLineVariants = {
  top: {
    open:   { rotate: 45,   y: 7,  transition: { duration: 0.25, ease: EASE_SPRING } },
    closed: { rotate: 0,    y: 0,  transition: { duration: 0.25, ease: EASE_SPRING } },
  },
  mid: {
    open:   { opacity: 0, scaleX: 0, transition: { duration: 0.15 } },
    closed: { opacity: 1, scaleX: 1, transition: { duration: 0.2, delay: 0.05 } },
  },
  bot: {
    open:   { rotate: -45, y: -7, transition: { duration: 0.25, ease: EASE_SPRING } },
    closed: { rotate: 0,   y: 0,  transition: { duration: 0.25, ease: EASE_SPRING } },
  },
};

// ─── HamburgerIcon ───────────────────────────────────────────────────────────

const HamburgerIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <motion.rect
      x="2" y="5" width="18" height="2" rx="1" fill="currentColor"
      variants={hamburgerLineVariants.top}
      animate={isOpen ? 'open' : 'closed'}
    />
    <motion.rect
      x="2" y="10" width="18" height="2" rx="1" fill="currentColor"
      variants={hamburgerLineVariants.mid}
      animate={isOpen ? 'open' : 'closed'}
    />
    <motion.rect
      x="2" y="15" width="18" height="2" rx="1" fill="currentColor"
      variants={hamburgerLineVariants.bot}
      animate={isOpen ? 'open' : 'closed'}
    />
  </svg>
);

// ─── Main Navbar ─────────────────────────────────────────────────────────────

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, switchDemoRole, activeView, setActiveView } = useAuth();
  const { theme, toggleTheme, language, setLanguage, voiceEnabled, toggleVoice, isSpeaking, stopSpeaking } = useTheme();

  const [langMenuOpen, setLangMenuOpen]   = useState(false);
  const [roleMenuOpen, setRoleMenuOpen]   = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);

  // Close dropdowns on outside click
  const langRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangMenuOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 769) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleBrandClick = () =>
    setActiveView(isAuthenticated ? (user?.role === 'admin' ? 'admin' : 'student') : 'auth');

  // ── Shared control atoms ──────────────────────────────────────────────────

  const VoiceBtn = () => (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={isSpeaking ? stopSpeaking : toggleVoice}
      title={voiceEnabled ? (isSpeaking ? 'Stop Speaking' : 'Voice Assistance Active') : 'Enable Voice Assistant'}
      style={{
        padding: '0.45rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)',
        backgroundColor: isSpeaking ? 'var(--secondary)' : (voiceEnabled ? 'var(--primary-light)' : 'transparent'),
        color: isSpeaking ? '#ffffff' : (voiceEnabled ? 'var(--primary)' : 'var(--text-muted)'),
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        transition: 'background-color var(--transition-fast), color var(--transition-fast)',
      }}
    >
      {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      <span className="hide-on-mobile" style={{ fontSize: '0.75rem' }}>
        {isSpeaking ? 'Speaking…' : (voiceEnabled ? 'Voice On' : 'Voice Off')}
      </span>
    </motion.button>
  );

  const ThemeBtn = () => (
    <motion.button
      whileHover={{ scale: 1.08, rotate: 15 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      style={{
        padding: '0.5rem',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-main)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex' }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} color="#fbbf24" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );

  // ── Language dropdown ─────────────────────────────────────────────────────
  const LangDropdown = () => (
    <div ref={langRef} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setLangMenuOpen(prev => !prev)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.45rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-main)',
          fontSize: '0.82rem', fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <Globe size={15} color="var(--primary)" />
        <span>{language.native}</span>
        <motion.span animate={{ rotate: langMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} color="var(--text-muted)" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {langMenuOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden" animate="visible" exit="exit"
            style={{
              position: 'absolute', right: 0, marginTop: '0.4rem',
              width: '160px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
              padding: '0.4rem',
              zIndex: 100,
            }}
          >
            {LANGUAGES.map(lang => (
              <div
                key={lang.code}
                onClick={() => { setLanguage(lang); setLangMenuOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', fontSize: '0.82rem',
                  color: language.code === lang.code ? 'var(--primary)' : 'var(--text-main)',
                  backgroundColor: language.code === lang.code ? 'var(--primary-light)' : 'transparent',
                  fontWeight: language.code === lang.code ? 700 : 500,
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                <span>{lang.native}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({lang.label})</span>
                {language.code === lang.code && <Check size={14} color="var(--primary)" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── Demo role switcher ────────────────────────────────────────────────────
  const RoleDropdown = () => (
    <div ref={roleRef} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setRoleMenuOpen(prev => !prev)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.45rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
          color: 'var(--primary)',
          fontSize: '0.78rem', fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <span>Demo Switcher</span>
        <motion.span animate={{ rotate: roleMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {roleMenuOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden" animate="visible" exit="exit"
            style={{
              position: 'absolute', right: 0, marginTop: '0.4rem',
              width: '240px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
              padding: '0.5rem',
              zIndex: 100,
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, padding: '0.2rem 0.5rem', textTransform: 'uppercase' }}>
              Evaluate Personas:
            </div>
            {[
              { label: '🎓 College Student (Aarav)',  action: () => switchDemoRole('student', 'college') },
              { label: '🎒 School Student (Priya)',    action: () => switchDemoRole('student', 'school') },
              { label: '💼 Working Professional (Rohan)', action: () => switchDemoRole('student', 'professional') },
            ].map(item => (
              <div
                key={item.label}
                onClick={() => { item.action(); setRoleMenuOpen(false); }}
                style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', transition: 'background-color var(--transition-fast)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-muted)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {item.label}
              </div>
            ))}
            <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.3rem 0' }} />
            <div
              onClick={() => { switchDemoRole('admin'); setRoleMenuOpen(false); }}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 700 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--danger-bg)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              🛡️ Admin Portal (User Management)
            </div>
            <div
              onClick={() => { setActiveView('auth'); setRoleMenuOpen(false); }}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-light)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              ✨ Universal Signup &amp; Login View
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── User profile chip ─────────────────────────────────────────────────────
  const UserChip = () =>
    isAuthenticated ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.35rem 0.65rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-muted)',
          fontSize: '0.82rem', fontWeight: 600,
        }}>
          <UserCircle size={18} color="var(--primary)" />
          <span className="hide-on-mobile">{user?.name.split(' ')[0]}</span>
          {user?.role === 'student' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#ea580c', fontSize: '0.75rem', fontWeight: 800 }}>
              <Flame size={14} fill="#ea580c" /> 12
            </span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.08, color: 'var(--danger)' }}
          whileTap={{ scale: 0.92 }}
          onClick={logout}
          title="Log out"
          style={{
            padding: '0.45rem', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'transparent', color: 'var(--text-muted)',
            cursor: 'pointer', display: 'flex',
          }}
        >
          <LogOut size={16} />
        </motion.button>
      </div>
    ) : null;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          height: 'var(--navbar-height)',
          backgroundColor: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          transition: 'background-color var(--transition-normal)',
          flexShrink: 0,
        }}
      >
        <div className="navbar-inner">
          {/* ── Brand ── */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
            onClick={handleBrandClick}
          >
            <AarvaLogo size="sm" showSubtitle={true} />
            {activeView !== 'auth' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  fontSize: '0.72rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: activeView === 'admin' ? 'rgba(239,68,68,0.12)' : 'var(--primary-light)',
                  color: activeView === 'admin' ? 'var(--danger)' : 'var(--primary)',
                  border: `1px solid ${activeView === 'admin' ? 'rgba(239,68,68,0.25)' : 'rgba(79,70,229,0.25)'}`,
                }}
              >
                {activeView === 'admin' ? <ShieldCheck size={12} /> : <Sparkles size={12} />}
                {activeView === 'admin' ? 'Admin Portal' : 'Student Portal'}
              </motion.span>
            )}
          </div>

          {/* ── Desktop Controls (hidden on mobile) ── */}
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <VoiceBtn />
            <LangDropdown />
            <ThemeBtn />
            <RoleDropdown />
            <UserChip />
          </div>

          {/* ── Mobile: theme toggle always visible + hamburger ── */}
          <div className="show-on-mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThemeBtn />
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(prev => !prev)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              style={{
                padding: '0.45rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: mobileOpen ? 'var(--primary-light)' : 'var(--bg-surface)',
                color: mobileOpen ? 'var(--primary)' : 'var(--text-main)',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                transition: 'background-color var(--transition-fast)',
              }}
            >
              <HamburgerIcon isOpen={mobileOpen} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="overlay"
              variants={overlayVariants}
              initial="hidden" animate="visible" exit="exit"
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                backgroundColor: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(2px)',
                zIndex: 48,
              }}
            />

            {/* Drawer panel */}
            <motion.nav
              key="drawer"
              variants={drawerVariants}
              initial="hidden" animate="visible" exit="exit"
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 'min(320px, 88vw)',
                backgroundColor: 'var(--bg-surface)',
                borderLeft: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 49,
                display: 'flex', flexDirection: 'column',
                padding: '1rem',
                gap: '0.5rem',
                overflowY: 'auto',
              }}
            >
              {/* Drawer header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <AarvaLogo size="sm" showSubtitle={false} />
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '0.4rem', borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'transparent', color: 'var(--text-muted)',
                    cursor: 'pointer', display: 'flex',
                  }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.25rem 0' }} />

              {/* Voice */}
              <div style={{ padding: '0.35rem 0' }}><VoiceBtn /></div>

              {/* Language rows */}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.35rem 0.1rem' }}>
                  Language
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang); setMobileOpen(false); }}
                      style={{
                        padding: '0.45rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: language.code === lang.code ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: language.code === lang.code ? 'var(--primary-light)' : 'var(--bg-muted)',
                        color: language.code === lang.code ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: language.code === lang.code ? 700 : 500,
                        fontSize: '0.8rem', cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {lang.native}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.25rem 0' }} />

              {/* Demo role switcher (stacked) */}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.35rem 0.1rem' }}>
                  Evaluate Personas
                </div>
                {[
                  { label: '🎓 College Student (Aarav)', action: () => switchDemoRole('student', 'college') },
                  { label: '🎒 School Student (Priya)',   action: () => switchDemoRole('student', 'school') },
                  { label: '💼 Working Professional (Rohan)', action: () => switchDemoRole('student', 'professional') },
                  { label: '🛡️ Admin Portal',             action: () => switchDemoRole('admin'),             danger: true },
                  { label: '✨ Signup / Login View',       action: () => setActiveView('auth'),              primary: true },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setMobileOpen(false); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: item.danger ? 'var(--danger)' : item.primary ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: (item.danger || item.primary) ? 700 : 500,
                      fontSize: '0.85rem', cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-muted)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* User chip + logout */}
              {isAuthenticated && (
                <>
                  <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '0.25rem 0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      <UserCircle size={20} color="var(--primary)" />
                      <span>{user?.name}</span>
                      {user?.role === 'student' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#ea580c', fontWeight: 800 }}>
                          <Flame size={14} fill="#ea580c" /> 12
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.45rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer', fontSize: '0.8rem',
                      }}
                    >
                      <LogOut size={15} /> Log out
                    </button>
                  </div>
                </>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
