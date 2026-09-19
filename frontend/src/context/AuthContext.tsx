import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LearnerType, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | 'guest';
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: UserRole, learnerType?: LearnerType) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start on auth screen ("auth") or pre-authenticated if desired
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('auth'); // 'auth', 'student', 'admin'

  const login = async (email: string, requestedRole: UserRole = 'student'): Promise<boolean> => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: requestedRole === 'admin' ? 'admin123' : 'student123',
          portal: requestedRole
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          learner_type: data.user.learner_type
        });
        setActiveView(data.user.role === 'admin' ? 'admin' : 'student');
        return true;
      }
    } catch (e) {
      console.warn("Backend API not reachable, falling back to local session:", e);
    }

    // Local fallback for smooth demonstration
    if (requestedRole === 'admin') {
      setUser({
        id: 1,
        name: 'AARVA Administrator',
        email: email || 'admin@aarva.edu',
        role: 'admin'
      });
      setActiveView('admin');
    } else {
      setUser({
        id: 2,
        name: 'Aarav Sharma',
        email: email || 'aarav.sharma@college.edu',
        role: 'student',
        learner_type: 'college',
        institution: 'IIT Madras'
      });
      setActiveView('student');
    }
    return true;
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: 'student',
          learner_type: data.user.learner_type
        });
        setActiveView('student');
        return true;
      }
    } catch (e) {
      console.warn("Backend API signup fallback:", e);
    }

    // Local fallback
    setUser({
      id: 99,
      name: userData.name || 'New Learner',
      email: userData.email || 'learner@aarva.edu',
      role: 'student',
      learner_type: userData.learner_type || 'college'
    });
    setActiveView('student');
    return true;
  };

  const logout = () => {
    setUser(null);
    setActiveView('auth');
  };

  const switchDemoRole = (targetRole: UserRole, learnerType: LearnerType = 'college') => {
    if (targetRole === 'admin') {
      setUser({
        id: 1,
        name: 'AARVA Administrator',
        email: 'admin@aarva.edu',
        role: 'admin'
      });
      setActiveView('admin');
    } else {
      const names: Record<LearnerType, string> = {
        college: 'Aarav Sharma (College Student)',
        school: 'Priya Patel (School Student)',
        professional: 'Rohan Iyer (Working Professional)',
        independent: 'Maya Sen (Independent Learner)'
      };
      setUser({
        id: 2,
        name: names[learnerType],
        email: `${learnerType}.demo@aarva.edu`,
        role: 'student',
        learner_type: learnerType,
        institution: learnerType === 'college' ? 'IIT Madras' : (learnerType === 'school' ? 'DPS R.K. Puram' : 'TechCorp Inc.')
      });
      setActiveView('student');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'guest',
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        switchDemoRole,
        activeView,
        setActiveView
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
