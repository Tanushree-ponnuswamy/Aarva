export type LearnerType = 'school' | 'college' | 'professional' | 'independent';

export type UserRole = 'student' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  learner_type?: LearnerType;
  phone?: string;
  institution?: string;
  department?: string;
}

export interface Textbook {
  id: number;
  title: string;
  author: string;
  file_name: string;
  file_size: string;
  total_pages: number;
  status: 'uploading' | 'processing' | 'processed';
  uploaded_at: string;
  has_summary?: boolean;
}

export interface ChapterSummary {
  chapter: number;
  title: string;
  pages: string;
  summary: string;
}

export interface DefinitionItem {
  term: string;
  definition: string;
}

export interface SummaryData {
  textbook_id: number;
  title: string;
  mode: 'complete' | 'chapter' | 'page' | 'concept';
  summary: string;
  chapters?: ChapterSummary[];
  key_points?: string[];
  definitions?: DefinitionItem[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_option: number;
  explanation: string;
}

export interface QuizSubmissionResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  feedback: string;
  new_badge_unlocked?: string;
}

export interface ChapterJourneyMilestone {
  chapter_num: number;
  title: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  progress_pct?: number;
  pages: string;
  summary_completed: boolean;
  quiz_completed: boolean;
  xp_earned: number;
}

export interface ConceptMasteryItem {
  concept: string;
  status: 'mastered' | 'learning' | 'needs_review';
  mastery_pct: number;
  last_reviewed: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface NextAchievement {
  title: string;
  requirement: string;
  progress_current: number;
  progress_target: number;
  reward_xp: number;
}

export interface GamificationData {
  xp: number;
  level: number;
  level_title: string;
  next_level_xp: number;
  next_achievement: NextAchievement;
  chapter_journey: ChapterJourneyMilestone[];
  concept_mastery: ConceptMasteryItem[];
}

export interface StudentDashboardData {
  student: User;
  stats: {
    textbooks_count: number;
    completed_topics: number;
    streak_days: number;
    avg_quiz_score: number;
    mastery_level: string;
    xp: number;
    level: number;
    level_title: string;
    next_level_xp: number;
  };
  gamification?: GamificationData;
  textbooks: Textbook[];
  recent_quizzes: {
    id: number;
    topic: string;
    score: string;
    percentage: number;
    date: string;
  }[];
  adaptive_recommendations: {
    topic: string;
    type: string;
    difficulty: string;
    duration: string;
  }[];
  badges: AchievementBadge[];
}

// Strictly Admin User Management Types
export interface AdminMetrics {
  total_users: number;
  active_accounts: number;
}

export interface AdminStudentItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  role?: string;
  learner_type: string;
  institution: string;
  department: string;
  registered_at: string;
  last_login: string;
  is_currently_active: boolean;
}
