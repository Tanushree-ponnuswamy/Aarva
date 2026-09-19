import React from 'react';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { UniversalSignup } from './components/UniversalSignup';
import { StudentPortal } from './components/StudentPortal';
import { AdminPortal } from './components/AdminPortal';

// ─── Page transition variant ──────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const } },
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
  >
    {children}
  </motion.div>
);

// ─── Main app content ─────────────────────────────────────────────────────────
const MainAppContent: React.FC = () => {
  const { activeView } = useAuth();

  return (
    <div className="aarva-app">
      <Navbar />
      <div className="page-shell">
        <AnimatePresence mode="wait" initial={false}>
          {activeView === 'auth' && (
            <PageWrapper key="auth">
              <UniversalSignup />
            </PageWrapper>
          )}
          {activeView === 'student' && (
            <PageWrapper key="student">
              <StudentPortal />
            </PageWrapper>
          )}
          {activeView === 'admin' && (
            <PageWrapper key="admin">
              <AdminPortal />
            </PageWrapper>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
