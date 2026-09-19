import { Textbook, SummaryData, QuizQuestion, QuizSubmissionResult, StudentDashboardData, AdminMetrics, AdminStudentItem } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

// Fallback seed data in case backend server is paused
const MOCK_TEXTBOOKS: Textbook[] = [
  {
    id: 1,
    title: 'Computer Networks: A Systems Approach',
    author: 'Larry L. Peterson, Bruce S. Davie',
    file_name: 'computer_networks_peterson.pdf',
    file_size: '14.2 MB',
    total_pages: 640,
    status: 'processed',
    uploaded_at: '2026-09-18 10:30',
    has_summary: true
  },
  {
    id: 2,
    title: 'Principles of Modern Operating Systems',
    author: 'Silberschatz & Galvin',
    file_name: 'operating_systems_galvin.pdf',
    file_size: '18.5 MB',
    total_pages: 820,
    status: 'processed',
    uploaded_at: '2026-09-15 14:20',
    has_summary: true
  },
  {
    id: 3,
    title: 'Deep Learning & Neural Architectures',
    author: 'Ian Goodfellow, Yoshua Bengio',
    file_name: 'deep_learning_goodfellow.pdf',
    file_size: '22.0 MB',
    total_pages: 780,
    status: 'processed',
    uploaded_at: '2026-09-10 09:15',
    has_summary: true
  }
];

export const api = {
  // Student Dashboard
  async getStudentDashboard(userId: number = 2): Promise<StudentDashboardData> {
    try {
      const res = await fetch(`${API_BASE}/student/dashboard/${userId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using mock student dashboard data:', e);
    }
    return {
      student: {
        id: userId,
        name: 'Aarav Sharma',
        email: 'aarav.sharma@college.edu',
        role: 'student',
        learner_type: 'college',
        institution: 'Indian Institute of Technology, Madras',
        department: 'Computer Science & Engineering'
      },
      stats: {
        textbooks_count: 3,
        completed_topics: 18,
        streak_days: 12,
        avg_quiz_score: 88.5,
        mastery_level: 'Architecture Scholar',
        xp: 240,
        level: 3,
        level_title: 'Architecture Scholar',
        next_level_xp: 500
      },
      gamification: {
        xp: 240,
        level: 3,
        level_title: 'Architecture Scholar',
        next_level_xp: 500,
        next_achievement: {
          title: 'Chapter Explorer',
          requirement: 'Complete 2 more chapter summaries',
          progress_current: 1,
          progress_target: 3,
          reward_xp: 100
        },
        chapter_journey: [
          {
            chapter_num: 1,
            title: 'Foundation & Layered Architecture',
            status: 'completed',
            pages: '1-54',
            summary_completed: true,
            quiz_completed: true,
            xp_earned: 50
          },
          {
            chapter_num: 2,
            title: 'Direct Link Networks & Framing',
            status: 'completed',
            pages: '55-120',
            summary_completed: true,
            quiz_completed: true,
            xp_earned: 50
          },
          {
            chapter_num: 3,
            title: 'Packet Switching & Bridging',
            status: 'in_progress',
            progress_pct: 60,
            pages: '121-190',
            summary_completed: true,
            quiz_completed: false,
            xp_earned: 30
          },
          {
            chapter_num: 4,
            title: 'Internetworking (IP) & Routing',
            status: 'upcoming',
            pages: '191-280',
            summary_completed: false,
            quiz_completed: false,
            xp_earned: 0
          }
        ],
        concept_mastery: [
          { concept: 'Sliding Window Protocol', status: 'mastered', mastery_pct: 94, last_reviewed: 'Today' },
          { concept: 'OSPF & Dijkstra SPF', status: 'mastered', mastery_pct: 88, last_reviewed: 'Yesterday' },
          { concept: 'CIDR & Subnet Routing', status: 'learning', mastery_pct: 72, last_reviewed: '3 days ago' },
          { concept: 'TCP Congestion Control (AIMD)', status: 'needs_review', mastery_pct: 58, last_reviewed: '5 days ago' }
        ]
      },
      textbooks: MOCK_TEXTBOOKS,
      recent_quizzes: [
        { id: 101, topic: 'Network Layer & IP Routing', score: '9/10', percentage: 90, date: 'Sep 17, 2026' },
        { id: 102, topic: 'Sliding Window & Flow Control', score: '8/10', percentage: 80, date: 'Sep 15, 2026' },
        { id: 103, topic: 'TCP vs UDP Deep Dive', score: '10/10', percentage: 100, date: 'Sep 12, 2026' }
      ],
      adaptive_recommendations: [
        { topic: 'High-Performance TCP Tuning & BBR', type: 'Deep Dive', difficulty: 'Hard', duration: '15 mins' },
        { topic: 'Distributed Consensus & Raft Protocol', type: 'Interactive Lab', difficulty: 'Advanced', duration: '25 mins' }
      ],
      badges: [
        { id: 'first_summary', title: 'First Summary', icon: '✨', description: 'Generated first chapter AI synthesis', unlocked: true },
        { id: 'chapter_explorer', title: 'Chapter Explorer', icon: '🧭', description: 'Summarized 3 consecutive chapters', unlocked: true },
        { id: 'concept_master', title: 'Concept Master', icon: '🧠', description: 'Scored 90%+ in a concept test', unlocked: true },
        { id: 'consistency', title: 'Consistency Champion', icon: '🔥', description: 'Maintained a 7-day study streak', unlocked: true },
        { id: 'book_completed', title: 'Book Completed', icon: '🏆', description: 'Synthesized and mastered an entire textbook', unlocked: false }
      ]
    };
  },

  async awardXp(userId: number, activityType: string, amount: number = 50): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/student/award-xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, activity_type: activityType, xp_amount: amount })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('awardXp local fallback:', e);
    }
    return { success: true, awarded_xp: amount, message: `+${amount} XP earned!` };
  },

  // Textbooks
  async getTextbooks(userId: number = 2): Promise<Textbook[]> {
    try {
      const res = await fetch(`${API_BASE}/textbooks/?user_id=${userId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using mock textbooks:', e);
    }
    return MOCK_TEXTBOOKS;
  },

  async uploadTextbook(userId: number, title: string, author: string, pages: number = 180): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('user_id', userId.toString());
      formData.append('title', title);
      formData.append('author', author);
      formData.append('pages', pages.toString());

      const res = await fetch(`${API_BASE}/textbooks/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Upload fallback simulation:', e);
    }
    return {
      success: true,
      textbook: {
        id: Date.now(),
        title,
        author,
        file_name: `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        file_size: '9.5 MB',
        total_pages: pages,
        status: 'processed',
        uploaded_at: 'Just now'
      }
    };
  },

  // Summaries
  async getSummary(textbookId: number = 1, mode: string = 'complete', chapter?: number, concept?: string): Promise<SummaryData> {
    try {
      let url = `${API_BASE}/summary/${textbookId}?mode=${mode}`;
      if (chapter) url += `&chapter=${chapter}`;
      if (concept) url += `&concept=${encodeURIComponent(concept)}`;

      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using mock summary data:', e);
    }

    return {
      textbook_id: textbookId,
      title: 'Computer Networks: A Systems Approach',
      mode: mode as any,
      summary: 'Comprehensive overview of computer networks focusing on the OSI and TCP/IP stack, socket programming, packet switching, flow control, routing algorithms (OSPF, BGP), and transport layer mechanisms like TCP congestion control.',
      chapters: [
        { chapter: 1, title: 'Foundation & Layered Architecture', pages: '1-54', summary: 'Covers network edges, packet switching vs circuit switching, transmission delays, and the 7-layer OSI model.' },
        { chapter: 2, title: 'Direct Link Networks & Framing', pages: '55-120', summary: 'Framing, error detection algorithms (CRC, Hamming code), reliable transmission protocols like Stop-and-Wait and Sliding Window.' },
        { chapter: 3, title: 'Packet Switching & Bridging', pages: '121-190', summary: 'Datagram and virtual circuit models, spanning tree algorithm in Ethernet switches, and cell switching (ATM).' },
        { chapter: 4, title: 'Internetworking (IP)', pages: '191-280', summary: 'IPv4 addressing, subnetting, CIDR, DHCP, NAT, IPv6 transition, and dynamic routing algorithms (Dijkstra, Bellman-Ford).' }
      ],
      key_points: [
        'Packet switching maximizes channel utilization through statistical multiplexing over dedicated physical paths.',
        'The sliding window protocol guarantees ordered, lossless delivery while keeping the link bandwidth saturated.',
        'TCP uses Additive Increase Multiplicative Decrease (AIMD) for fair, distributed congestion control across autonomous flows.',
        'CIDR and route aggregation prevent global internet routing table saturation.'
      ],
      definitions: [
        { term: 'CIDR (Classless Inter-Domain Routing)', definition: 'A method for allocating IP addresses and IP routing that replaces fixed classful networks, mitigating address waste.' },
        { term: 'Round Trip Time (RTT)', definition: 'The duration for a data packet to travel from sender to receiver plus the time for its ACK to return.' },
        { term: 'Congestion Window (cwnd)', definition: 'A sender-side state variable in TCP limiting the volume of unacknowledged bytes in flight.' }
      ]
    };
  },

  // AI Chat with Mistral
  async chatWithTutor(query: string, textbookId: number = 1, language: string = 'English'): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/summary/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, textbook_id: textbookId, language })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using mock AI tutor reply:', e);
    }

    return {
      query,
      response: `The **Sliding Window Protocol** is an essential transport mechanism in networking. It allows the sender to transmit multiple data packets before needing an acknowledgment (ACK), greatly increasing throughput over high-latency links. The size of this window is dynamically adjusted based on the receiver's available buffer capacity (flow control) and the network's packet drop rate (congestion control).`,
      sources: [
        { title: 'Computer Networks: A Systems Approach', chapter: 'Chapter 2: Direct Link Networks', page: 74 }
      ],
      suggested_followups: [
        'How does Go-Back-N differ from Selective Repeat?',
        'Can you show a visual step-by-step example of ACK reception?',
        'Give me a quick 2-question quiz on sliding windows!'
      ]
    };
  },

  // Quizzes
  async getQuiz(textbookId: number = 1): Promise<{ questions: QuizQuestion[]; topic: string; total_questions: number }> {
    try {
      const res = await fetch(`${API_BASE}/quiz/${textbookId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using mock quiz:', e);
    }

    return {
      topic: 'Core Networking & Transport Layer Protocols',
      total_questions: 4,
      questions: [
        {
          id: 1,
          question: 'Which layer in the OSI model is responsible for reliable process-to-process data delivery?',
          options: ['Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Data Link Layer (Layer 2)', 'Session Layer (Layer 5)'],
          correct_option: 1,
          explanation: 'The Transport Layer (Layer 4), utilizing protocols like TCP, ensures end-to-end reliability, segmentation, and process addressing.'
        },
        {
          id: 2,
          question: "In the Sliding Window Protocol, what is the purpose of the 'advertised window'?",
          options: [
            'To tell routers how fast to forward packets',
            'To signal the maximum bandwidth of the physical cable',
            'To inform the sender of available buffer space at the receiver',
            'To encrypt header authentication data'
          ],
          correct_option: 2,
          explanation: 'The receiver advertises its available buffer space in ACKs to prevent sender-side buffer overflow.'
        },
        {
          id: 3,
          question: 'Which algorithm is utilized by OSPF (Open Shortest Path First) for routing path computation?',
          options: ['Bellman-Ford Algorithm', "Dijkstra's Link-State Algorithm", 'Floyd-Warshall All-Pairs Algorithm', "Prim's Minimum Spanning Tree"],
          correct_option: 1,
          explanation: "OSPF relies on Dijkstra's Shortest Path First (SPF) algorithm to calculate loop-free shortest paths."
        },
        {
          id: 4,
          question: 'What primary issue does CIDR (Classless Inter-Domain Routing) solve?',
          options: [
            'Slow DNS hostname lookup times',
            'Rapid depletion of IPv4 addresses and routing table bloat',
            'Packet fragmentation on high MTU links',
            'Insecure transmission of unencrypted plaintext passwords'
          ],
          correct_option: 1,
          explanation: 'CIDR eliminated rigid Class A, B, and C constraints, allowing prefix aggregation to preserve addresses and shrink routing tables.'
        }
      ]
    };
  },

  async submitQuiz(userId: number, textbookId: number, topic: string, answers: any[]): Promise<QuizSubmissionResult> {
    try {
      const res = await fetch(`${API_BASE}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, textbook_id: textbookId, topic, answers })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using mock quiz result:', e);
    }

    const correct = answers.filter(a => a.is_correct).length;
    const total = answers.length;
    const pct = Math.round((correct / total) * 100);

    return {
      score: correct,
      total,
      percentage: pct,
      passed: pct >= 70,
      feedback: pct >= 80 ? 'Mastery demonstrated! You have a solid grasp of core transport mechanics.' : 'Good effort! Review the chapter summary to strengthen your understanding.',
      new_badge_unlocked: pct >= 90 ? 'Quiz Ace' : undefined
    };
  },

  // Strictly Admin User Management
  async getAdminMetrics(): Promise<AdminMetrics> {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using mock admin metrics:', e);
    }
    return {
      total_users: 142,
      active_accounts: 18
    };
  },

  async getAdminStudents(search?: string, learnerType?: string): Promise<AdminStudentItem[]> {
    try {
      let url = `${API_BASE}/admin/students?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (learnerType) url += `learner_type=${encodeURIComponent(learnerType)}`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Using mock admin students:', e);
    }
    return [
      {
        id: 2,
        name: 'Aarav Sharma',
        email: 'aarav.sharma@college.edu',
        phone: '+91 98123 45678',
        is_active: true,
        role: 'student',
        learner_type: 'College Student',
        institution: 'IIT Madras',
        department: 'Computer Science & Engineering',
        registered_at: 'Sep 01, 2026',
        last_login: 'Today · 11:45 AM',
        is_currently_active: true
      },
      {
        id: 3,
        name: 'Priya Patel',
        email: 'priya.patel@school.edu',
        phone: '+91 99887 76655',
        is_active: true,
        role: 'student',
        learner_type: 'School Student',
        institution: 'DPS R.K. Puram',
        department: 'Class 11 Science (CBSE)',
        registered_at: 'Sep 05, 2026',
        last_login: 'Today · 09:15 AM',
        is_currently_active: true
      },
      {
        id: 4,
        name: 'Rohan Iyer',
        email: 'rohan.iyer@techcorp.com',
        phone: '+91 97654 32109',
        is_active: true,
        role: 'student',
        learner_type: 'Working Professional',
        institution: 'TechCorp Cloud Systems',
        department: 'Cloud Solutions Architect',
        registered_at: 'Sep 08, 2026',
        last_login: 'Yesterday · 06:20 PM',
        is_currently_active: false
      },
      {
        id: 5,
        name: 'Maya Sen',
        email: 'maya.sen@learner.net',
        phone: '+91 95432 10987',
        is_active: true,
        role: 'student',
        learner_type: 'Independent Learner',
        institution: 'Independent Studies',
        department: 'Neurobiology & Cognitive AI',
        registered_at: 'Sep 12, 2026',
        last_login: 'Sep 16, 2026 · 02:10 PM',
        is_currently_active: false
      }
    ];
  },

  async toggleStudentStatus(studentId: number): Promise<{ success: boolean; is_active: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/admin/students/${studentId}/toggle-status`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Toggle status fallback:', e);
    }
    return { success: true, is_active: true };
  },

  async getStudentDetail(studentId: number): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/students/${studentId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Student detail fallback:', e);
    }
    return null;
  }
};
