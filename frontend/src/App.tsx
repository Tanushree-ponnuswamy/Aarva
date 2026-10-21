import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { useTranslation, SUPPORTED_LANGUAGES, LanguageCode } from "./i18n";
import { LanguageSelector } from "./LanguageSelector";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

const team = [
  {
    name: "Maya Chen",
    role: "Product Director",
    image:
      "https://images.unsplash.com/photo-1780396378407-07411c56389c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=1100",
  },
  {
    name: "Noah Williams",
    role: "Experience Designer",
    image:
      "https://images.unsplash.com/photo-1780733062177-19a10802609f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=1100",
  },
  {
    name: "Sofia Laurent",
    role: "Creative Strategist",
    image:
      "https://images.unsplash.com/photo-1790502041570-b774346005e8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=1100",
  },
];

const features = [
  {
    number: "02",
    eyebrow: "Multi-layered AI summarization",
    title: "Instant summaries, chapter breakdowns, and definitions.",
    copy: "Never feel overwhelmed by 500-page textbooks again. Get high-impact 'In one sentence' overviews, chapter outlines, key takeaways, and auto-generated glossaries designed for fast revision.",
    visual: "summarization",
  },
  {
    number: "03",
    eyebrow: "Play your way to mastery",
    title: "Adaptive quizzes that target your exact knowledge gaps.",
    copy: "Reinforce what you study with 8 dynamic test formats—from multiple-choice and pair matching to card challenges and mind games. Questions dynamically adjust in difficulty as you improve.",
    visual: "tests",
  },
  {
    number: "04",
    eyebrow: "Personalized learning momentum",
    title: "Personalized study goals, streaks, and focus metrics.",
    copy: "Stay consistent with daily study time targets, focus scores, completion badges, and streak trackers designed to build lifelong learning habits.",
    visual: "dashboard",
  },
];

function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: "arrow" | "play" | "spark" | "linkedin" | "mail" | "instagram" | "youtube" | "send" | "send-up";
  size?: number;
  className?: string;
}) {
  const paths: Record<typeof name, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    "send-up": (
      <>
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </>
    ),
    play: <path d="m9 7 8 5-8 5V7Z" />,
    spark: <path d="M12 2c.5 5.2 2.8 8 8 8-5.2.5-7.5 2.8-8 8-.5-5.2-2.8-7.5-8-8 5.2-.5 7.5-2.8 8-8Z" />,
    linkedin: (
      <>
        <path d="M6 9v9M6 6v.01M10 18v-5a4 4 0 0 1 8 0v5M10 9v9" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
    youtube: (
      <>
        <path d="M21 12c0 4-.5 5.5-1.4 6.2C18.6 19 16.7 19 12 19s-6.6 0-7.6-.8C3.5 17.5 3 16 3 12s.5-5.5 1.4-6.2C5.4 5 7.3 5 12 5s6.6 0 7.6.8C20.5 6.5 21 8 21 12Z" />
        <path d="m10 9 5 3-5 3V9Z" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <a className={`logo ${dark ? "logo-dark" : ""}`} href="#home" aria-label="Aarva home">
      <img className="logo-img" src="/aarva-logo.png" alt="Aarva logo" width={34} height={34} />
      <span>Aarva</span>
    </a>
  );
}

function FeatureVisual({ type }: { type: string }) {
  if (type === "chat") {
    return (
      <div className="visual-stage feature-stage-chat" aria-hidden="true">
        <div className="feat-glow feat-glow-blue" />

        <div className="feat-chat-header">
          <div className="feat-chat-book-info">
            <span className="feat-chat-book-icon"><Icon name="spark" size={15} /></span>
            <div>
              <b>Deep Learning & Neural Architectures</b>
              <small>Chapter 4 • Backpropagation & Gradient Descent</small>
            </div>
          </div>
          <span className="feat-live-pill">
            <span className="pulse-dot" /> Grounded RAG
          </span>
        </div>

        <div className="feat-bubble feat-bubble-user">
          <p>How does backpropagation resolve vanishing gradients in deep networks?</p>
          <span className="feat-user-avatar">AL</span>
        </div>

        <div className="feat-bubble feat-bubble-ai">
          <div className="feat-ai-header">
            <span className="feat-ai-avatar"><Icon name="spark" size={13} /></span>
            <strong>Aarva AI</strong>
            <span className="feat-citation-badge">📖 Page 142, §4.2</span>
          </div>
          <p>
            Backpropagation distributes error gradients via the chain rule. To counter exponential gradient decay across deep layers, modern architectures employ residual skip connections and non-saturating activations.
          </p>
          <div className="feat-ai-callout">
            <b>Key Architecture:</b> Use <code>ReLU / GELU</code> activations, ResNet residuals, and Pre-LayerNorm.
          </div>
          <div className="feat-citation-footer">
            <span className="feat-tag">✓ Verified Source</span>
            <span className="feat-tag">99.8% Confidence</span>
            <span className="feat-tag">3 Cross-References</span>
          </div>
        </div>

        <div className="feat-prompt-pills">
          <span>Explain with an analogy</span>
          <span>Generate 3 quiz questions</span>
          <span>Show LaTeX formula</span>
        </div>

        <div className="feat-chip feat-chip-tr">
          <span className="feat-chip-icon">⚡</span>
          <div>
            <b>2.4k Chunks Indexed</b>
            <small>Vector & BM25 retrieval</small>
          </div>
        </div>
        <div className="feat-chip feat-chip-bl">
          <span className="feat-chip-icon">🛡️</span>
          <div>
            <b>Zero Hallucination</b>
            <small>Strict page-grounded AI</small>
          </div>
        </div>
      </div>
    );
  }

  if (type === "summarization") {
    return (
      <div className="visual-stage feature-stage-summary" aria-hidden="true">
        <div className="feat-glow feat-glow-violet" />

        <div className="feat-summary-tabs">
          <span className="feat-tab active">⚡ In One Sentence</span>
          <span className="feat-tab">📑 Chapter Breakdown</span>
          <span className="feat-tab">🧠 Core Glossary</span>
          <span className="feat-tab">🎯 High-Yield Notes</span>
        </div>

        <div className="feat-summary-hero-card">
          <div className="feat-summary-badge">
            <Icon name="spark" size={13} /> Core Essence
          </div>
          <h4>
            “Deep learning models construct hierarchical representations through stacked non-linear transformations optimized iteratively via backpropagation.”
          </h4>
          <div className="feat-summary-meta">
            <span>⏱️ 4 min read</span>
            <span>•</span>
            <span>📊 85% reading time saved</span>
            <span>•</span>
            <span>🎯 High-yield exam focus</span>
          </div>
        </div>

        <div className="feat-summary-grid">
          <div className="feat-summary-subcard">
            <span className="feat-subcard-tag">SECTION 01</span>
            <b>Loss Functions & Optimization</b>
            <p>Cross-entropy loss vs MSE for multi-class classification benchmarks.</p>
            <small>6 Key Takeaways</small>
          </div>
          <div className="feat-summary-subcard feat-subcard-accent">
            <span className="feat-subcard-tag">GLOSSARY EXTRACT</span>
            <b>Vanishing Gradient Dilemma</b>
            <p>Exponential decay of gradient magnitudes across chained derivatives.</p>
            <small>18 Key Terms</small>
          </div>
        </div>

        <div className="feat-chip feat-chip-tr">
          <span className="feat-chip-icon">📑</span>
          <div>
            <b>Multi-Tier AI</b>
            <small>TL;DR to Deep Notes</small>
          </div>
        </div>
        <div className="feat-chip feat-chip-bl">
          <span className="feat-chip-icon">✨</span>
          <div>
            <b>Auto-Glossary</b>
            <small>Synced with textbook</small>
          </div>
        </div>
      </div>
    );
  }

  if (type === "tests") {
    return (
      <div className="visual-stage feature-stage-tests" aria-hidden="true">
        <div className="feat-glow feat-glow-green" />

        <div className="feat-quiz-top">
          <div className="feat-quiz-info">
            <span className="feat-quiz-mode-pill">ADAPTIVE QUIZ • LEVEL 4</span>
            <b>Neural Networks Mastery</b>
          </div>
          <div className="feat-quiz-xp">
            <span>+120 XP</span>
            <small>🔥 7-Day Streak</small>
          </div>
        </div>

        <div className="feat-quiz-card">
          <div className="feat-quiz-qhead">
            <span className="feat-qnum">Q4 / 10 • MULTIPLE CHOICE</span>
            <span className="feat-timer">⏱️ 00:38 remaining</span>
          </div>
          <p className="feat-qtext">
            Which optimization technique dynamically modulates per-parameter learning rates using exponential moving averages of squared gradients?
          </p>

          <div className="feat-quiz-options">
            <div className="feat-option feat-option-correct">
              <span className="feat-opt-marker">✓</span>
              <div>
                <b>Adam Optimizer (Adaptive Moment Estimation)</b>
                <small>Combines Momentum with RMSProp adaptive scaling</small>
              </div>
              <span className="feat-opt-tag">94% Accuracy</span>
            </div>
            <div className="feat-option">
              <span className="feat-opt-marker">B</span>
              <div>
                <b>Standard Stochastic Gradient Descent (SGD)</b>
              </div>
            </div>
            <div className="feat-option">
              <span className="feat-opt-marker">C</span>
              <div>
                <b>LeakyReLU Activation Function</b>
              </div>
            </div>
            <div className="feat-option">
              <span className="feat-opt-marker">D</span>
              <div>
                <b>Batch Normalization Layer</b>
              </div>
            </div>
          </div>
        </div>

        <div className="feat-chip feat-chip-tr">
          <span className="feat-chip-icon">🎮</span>
          <div>
            <b>8 Test Formats</b>
            <small>MCQ, Pairs, Flashcards</small>
          </div>
        </div>
        <div className="feat-chip feat-chip-bl">
          <span className="feat-chip-icon">📈</span>
          <div>
            <b>Mastery: 92%</b>
            <small>Adaptive difficulty</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="visual-stage feature-stage-dashboard" aria-hidden="true">
      <div className="feat-glow feat-glow-violet" />

      <div className="feat-dash-top">
        <div className="feat-window-dots">
          <span className="dot-red" />
          <span className="dot-yellow" />
          <span className="dot-green" />
        </div>
        <div className="feat-dash-user">
          <span className="feat-user-indicator" />
          <b>Alex Morgan's Learning Workspace</b>
        </div>
        <span className="feat-dash-date">Daily Goal: 45m</span>
      </div>

      <div className="feat-dash-stats-row">
        <div className="feat-dash-stat-box">
          <small>WEEKLY STUDY</small>
          <b>14h 30m</b>
          <span className="feat-stat-up">↑ +18% vs last week</span>
        </div>
        <div className="feat-dash-stat-box">
          <small>FOCUS SCORE</small>
          <b>96 / 100</b>
          <span className="feat-stat-sub">Top 5% consistency</span>
        </div>
        <div className="feat-dash-stat-box">
          <small>ACTIVE TEXTBOOKS</small>
          <b>4 Books</b>
          <span className="feat-stat-sub">12 chapters mastered</span>
        </div>
      </div>

      <div className="feat-dash-content">
        <div className="feat-dash-focus-card">
          <div className="feat-focus-icon-wrap">
            <Icon name="spark" size={16} />
          </div>
          <div>
            <small>CURRENT IN FOCUS</small>
            <b>Machine Learning: Chapter 4</b>
            <div className="feat-dash-progress-track">
              <div className="feat-dash-progress-fill" style={{ width: "74%" }} />
            </div>
            <span className="feat-progress-text">74% Chapter Mastery Complete</span>
          </div>
        </div>

        <div className="feat-dash-mini-chart">
          <small>DAILY STUDY TIME (MINUTES)</small>
          <div className="feat-chart-bars">
            <div className="feat-bar-col"><span style={{ height: "45%" }} /><small>M</small></div>
            <div className="feat-bar-col"><span style={{ height: "70%" }} /><small>T</small></div>
            <div className="feat-bar-col"><span style={{ height: "60%" }} /><small>W</small></div>
            <div className="feat-bar-col"><span style={{ height: "90%" }} className="feat-bar-highlight" /><small>T</small></div>
            <div className="feat-bar-col"><span style={{ height: "80%" }} /><small>F</small></div>
            <div className="feat-bar-col"><span style={{ height: "55%" }} /><small>S</small></div>
            <div className="feat-bar-col"><span style={{ height: "95%" }} className="feat-bar-highlight" /><small>S</small></div>
          </div>
        </div>
      </div>

      <div className="feat-chip feat-chip-tr">
        <span className="feat-chip-icon">🎯</span>
        <div>
          <b>Daily Goal Met</b>
          <small>42m completed today</small>
        </div>
      </div>
      <div className="feat-chip feat-chip-bl">
        <span className="feat-chip-icon">🔥</span>
        <div>
          <b>Streak: 14 Days</b>
          <small>Unbroken momentum</small>
        </div>
      </div>
    </div>
  );
}

function LandingPage({ onStart, onLogin }: { onStart: () => void; onLogin: () => void }) {
  const [subscribed, setSubscribed] = useState(false);

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribed(true);
  }

  return (
    <div className="site-shell">
      <header className="nav-wrap">
        <nav className="nav glass" aria-label="Primary navigation">
          <div className="nav-left">
            <Logo />
            <div className="nav-links">
              <a href="#home">Home</a>
              <a href="#features">Features</a>
              <a href="#about">About us</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <a className="login-link" href="/dashboard" onClick={(event) => { event.preventDefault(); onLogin(); }}>
              <span>Log in</span>
              <Icon name="arrow" size={16} />
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero section-pad" id="home">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          <div className="hero-copy">
            <div className="eyebrow reveal"><span />NEXT-GEN AI STUDY ENGINE & ADAPTIVE COMPANION</div>
            <h1 className="reveal reveal-delay">
              Master any textbook. <br />
              <span className="gradient-text">Retain everything you learn.</span>
            </h1>
            <p className="hero-lede reveal reveal-delay-two">
              Upload dense textbooks, lecture notes, or syllabi. Aarva turns overwhelming chapters into interactive AI conversations, high-yield chapter summaries, and adaptive quizzes engineered for top scores and lifelong retention.
            </p>
            <div className="hero-actions reveal reveal-delay-three">
              <a className="button button-primary" href="/login" onClick={(event) => { event.preventDefault(); onStart(); }}>
                Get started free <Icon name="arrow" size={16} />
              </a>
              <a className="text-link" href="#features">
                <span className="play"><Icon name="play" size={14} /></span> Explore features
              </a>
            </div>
            <div className="trust-line reveal reveal-delay-three">
              <div className="avatar-stack"><span>A</span><span>N</span><span>S</span></div>
              <p><b>Loved by 10,000+ ambitious learners & researchers</b><br />100% grounded in your syllabus with zero hallucination</p>
            </div>
          </div>

          <div className="hero-art" aria-label="An animated hand holding the Aarva mobile app">
            <div className="hero-halo" />
            <svg className="hero-device" viewBox="0 0 1200 1200" role="img" aria-label="A hand holding a phone with the Aarva learning app open">
              <defs>
                <linearGradient id="aarvaScreen" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="65%" stopColor="#f2efff" />
                  <stop offset="100%" stopColor="#e5f0ff" />
                </linearGradient>
                <linearGradient id="aarvaButton" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#73a8ff" />
                  <stop offset="100%" stopColor="#7458f5" />
                </linearGradient>
                <clipPath id="phoneScreenClip"><rect x="400" y="112" width="428" height="918" rx="48" /></clipPath>
                <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#47328d" floodOpacity=".13" /></filter>
              </defs>
              <image href="https://images.unsplash.com/photo-1691256676376-357c3aa66c89?crop=entropy&amp;cs=tinysrgb&amp;fit=crop&amp;fm=jpg&amp;q=90&amp;w=1200" x="0" y="0" width="1200" height="1200" preserveAspectRatio="xMidYMid slice" />
              <g clipPath="url(#phoneScreenClip)">
                <rect x="400" y="112" width="428" height="918" fill="url(#aarvaScreen)" />
                <circle cx="790" cy="430" r="155" fill="#f2bde5" opacity=".18" />
                <rect x="426" y="158" width="45" height="45" rx="13" fill="url(#aarvaButton)" />
                <path d="M448 168c2 10 6 14 16 16-10 2-14 6-16 16-2-10-6-14-16-16 10-2 14-6 16-16Z" fill="white" />
                <text x="484" y="190" fill="#17142d" fontFamily="Manrope, sans-serif" fontSize="25" fontWeight="800">Aarva</text>
                <circle cx="784" cy="180" r="23" fill="#d8d0ff" />
                <text x="784" y="185" textAnchor="middle" fill="#4f35cf" fontFamily="Manrope, sans-serif" fontSize="11" fontWeight="700">AM</text>
                <text x="428" y="285" fill="#7458f5" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="700" letterSpacing="2">HELLO, ALEX</text>
                <text x="428" y="335" fill="#17142d" fontFamily="Manrope, sans-serif" fontSize="37" fontWeight="700">Learn something</text>
                <text x="428" y="380" fill="#17142d" fontFamily="Manrope, sans-serif" fontSize="37" fontWeight="700">wonderful today.</text>
                <g filter="url(#cardShadow)">
                  <rect x="425" y="434" width="378" height="154" rx="28" fill="white" />
                </g>
                <rect x="447" y="469" width="64" height="64" rx="18" fill="url(#aarvaButton)" />
                <path d="M463 483h31v36h-31zM478.5 483v36" fill="none" stroke="white" strokeWidth="3" />
                <text x="531" y="474" fill="#777189" fontFamily="DM Sans, sans-serif" fontSize="11" fontWeight="700" letterSpacing="1.5">TODAY&apos;S FOCUS</text>
                <text x="531" y="505" fill="#17142d" fontFamily="Manrope, sans-serif" fontSize="20" fontWeight="700">Neural networks</text>
                <text x="531" y="532" fill="#777189" fontFamily="DM Sans, sans-serif" fontSize="13">42 minute study plan</text>
                <circle cx="749" cy="509" r="30" fill="#ece7ff" />
                <path d="M749 479a30 30 0 1 1-26 45" fill="none" stroke="#7458f5" strokeWidth="8" strokeLinecap="round" />
                <text x="749" y="514" textAnchor="middle" fill="#17142d" fontFamily="Manrope, sans-serif" fontSize="10" fontWeight="700">72%</text>
                <rect x="425" y="614" width="178" height="112" rx="24" fill="white" />
                <text x="447" y="649" fill="#777189" fontFamily="DM Sans, sans-serif" fontSize="10" fontWeight="700" letterSpacing="1">STUDY TIME</text>
                <text x="447" y="694" fill="#17142d" fontFamily="Manrope, sans-serif" fontSize="27" fontWeight="700">42m</text>
                <rect x="625" y="614" width="178" height="112" rx="24" fill="white" />
                <text x="647" y="649" fill="#777189" fontFamily="DM Sans, sans-serif" fontSize="10" fontWeight="700" letterSpacing="1">POINTS</text>
                <text x="647" y="694" fill="#17142d" fontFamily="Manrope, sans-serif" fontSize="27" fontWeight="700">+120</text>
                <rect x="425" y="751" width="378" height="130" rx="25" fill="white" />
                <rect x="447" y="780" width="58" height="58" rx="17" fill="#d8d0ff" />
                <text x="476" y="817" textAnchor="middle" fill="#4f35cf" fontFamily="Manrope, sans-serif" fontSize="24" fontWeight="700">?</text>
                <text x="525" y="790" fill="#777189" fontFamily="DM Sans, sans-serif" fontSize="10" fontWeight="700" letterSpacing="1">UP NEXT</text>
                <text x="525" y="820" fill="#17142d" fontFamily="Manrope, sans-serif" fontSize="18" fontWeight="700">Knowledge check</text>
                <rect x="525" y="844" width="240" height="10" rx="5" fill="#e8e4f1" />
                <rect x="525" y="844" width="145" height="10" rx="5" fill="#7458f5" />
                <rect x="425" y="924" width="378" height="72" rx="24" fill="white" />
                <rect x="465" y="954" width="38" height="10" rx="5" fill="#7458f5" />
                <circle cx="584" cy="959" r="6" fill="#c8c3d5" />
                <circle cx="674" cy="959" r="6" fill="#c8c3d5" />
                <circle cx="764" cy="959" r="6" fill="#c8c3d5" />
              </g>
              <path d="M510 108h180v33c0 22-18 40-40 40H550c-22 0-40-18-40-40v-33Z" fill="#111116" />
            </svg>
            <div className="float-chip chip-one"><span>98%</span><small>Focus score</small></div>
            <div className="float-chip chip-two"><Icon name="spark" size={15} /><small>Idea saved</small></div>
          </div>
        </section>

        <section className="features section-pad" id="features">
          <div className="section-heading">
            <p className="kicker">Core Capabilities</p>
            <h2>Less passive reading.<br /><span className="gradient-text">More deep mastery.</span></h2>
            <p>Designed around how high-performing students and researchers actually retain and apply complex concepts.</p>
          </div>
          <div className="feature-list">
            {features.map((feature, index) => (
              <article className={`feature-row ${index % 2 ? "reverse" : ""}`} key={feature.number}>
                <div className="feature-copy">
                  <span className="feature-number">{feature.number}</span>
                  <p className="feature-eyebrow">{feature.eyebrow}</p>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                  <a className="learn-link" href="/login" onClick={(e) => { e.preventDefault(); onStart(); }}>
                    Try this feature <Icon name="arrow" size={18} />
                  </a>
                </div>
                <FeatureVisual type={feature.visual} />
              </article>
            ))}
          </div>
        </section>

        <section className="about section-pad" id="about">
          <div className="about-intro">
            <div>
              <p className="kicker">The people behind Aarva</p>
              <h2>Small team.<br /><span className="gradient-text">Big energy.</span></h2>
            </div>
            <p>We are designers, builders, and curious minds who believe technology should feel more human. Meet the people making that happen.</p>
          </div>
          <div className="team-grid">
            {team.map((person, index) => (
              <a
                className={`team-card team-${index + 1}`}
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                key={person.name}
                aria-label={`View ${person.name} on LinkedIn`}
              >
                <img src={person.image} alt={`${person.name}, ${person.role}`} />
                <span className="team-overlay">
                  <span><b>{person.name}</b><small>{person.role}</small></span>
                  <span className="social-button"><Icon name="linkedin" /></span>
                </span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer id="contact">
        <div className="footer-glow" />
        <div className="footer-main section-pad">
          <div className="footer-nav">
            <Logo dark />
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-newsletter">
            <p className="kicker">Stay in the loop</p>
            <h2>Good ideas belong in your inbox.</h2>
            <p>A thoughtful note on creativity, collaboration, and building better—sent occasionally.</p>
            {subscribed ? (
              <div className="success-message"><Icon name="spark" /> You&apos;re on the list. Welcome to Aarva.</div>
            ) : (
              <form onSubmit={subscribe}>
                <label className="sr-only" htmlFor="email">Email address</label>
                <input id="email" type="email" placeholder="you@email.com" required />
                <button type="submit">Subscribe <Icon name="arrow" size={18} /></button>
              </form>
            )}
          </div>
          <div className="footer-social">
            <p>Follow us</p>
            <span>Fresh ideas, behind the scenes, and the occasional very good playlist.</span>
            <div className="social-links">
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Icon name="linkedin" /></a>
              <a href="mailto:hello@aarva.app" aria-label="Email"><Icon name="mail" /></a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram" /></a>
              <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube"><Icon name="youtube" /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom section-pad">
          <span>© 2026 Aarva Studio</span>
          <span>Made with care for people with ideas.</span>
          <div><a href="#home">Privacy</a><a href="#home">Terms</a></div>
        </div>
      </footer>
    </div>
  );
}

type Route = "landing" | "auth" | "dashboard";

const studyImage =
  "https://images.unsplash.com/photo-1763890965393-1cea435581ab?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200&h=1500";

function MiniIcon({ name }: { name: "dashboard" | "upload" | "library" | "test" | "settings" | "menu" | "bell" | "clock" | "book" | "profile" }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M5 15v4h14v-4" /></>,
    library: <><path d="M4 5h5v14H4zM10 5h5v14h-5zM16 7h4v12h-4z" /></>,
    test: <><path d="M8 4h8l2 3v13H6V7l2-3Z" /><path d="M9 11h6m-6 4h4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.4-2.5h-4L10 6a8 8 0 0 0-1.5 1L6 6.1 4 9.5 6.1 11a7 7 0 0 0 0 2L4 14.5 6 18l2.5-1a8 8 0 0 0 1.5 1l.5 2.5h4L15 18a8 8 0 0 0 1.5-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1Z" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8Z" /><path d="M10 21h4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    book: <><path d="M4 5a3 3 0 0 1 3-2h5v17H7a3 3 0 0 0-3 2V5Zm16 0a3 3 0 0 0-3-2h-5v17h5a3 3 0 0 1 3 2V5Z" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /></>,
  };
  return <svg className="mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const API_BASE = (import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== "")
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? "http://127.0.0.1:8000" : "");

async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong.");
  return data;
}

function AuthPage({ onHome, onComplete }: { onHome: () => void; onComplete: (name: string) => void }) {
  // ── login form state ──────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState(() => localStorage.getItem("aarva_saved_email") || "");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [activeDemoLoading, setActiveDemoLoading] = useState<string | null>(null);

  const loginDemoAccount = async () => {
    setLoginError("");
    setForgotMsg("");
    setLoginLoading(true);
    setActiveDemoLoading("sample");
    try {
      const data = await apiPost("/api/auth/demo-login", { email: "student@college.edu" });
      localStorage.setItem("aarva_token", data.access_token);
      localStorage.setItem("aarva_user", JSON.stringify(data.user));
      localStorage.removeItem("aarva_active_book_id");
      onComplete(data.user.name);
    } catch (err: unknown) {
      // Fallback direct login via regular /api/auth/login
      const email = "student@college.edu";
      setLoginEmail(email);
      setLoginPassword("student123");
      try {
        const loginData = await apiPost("/api/auth/login", {
          email,
          password: "student123",
          portal: "student",
        });
        localStorage.setItem("aarva_token", loginData.access_token);
        localStorage.setItem("aarva_user", JSON.stringify(loginData.user));
        localStorage.removeItem("aarva_active_book_id");
        onComplete(loginData.user.name);
      } catch (e: unknown) {
        setLoginError(e instanceof Error ? e.message : "Failed to sign into sample account.");
      }
    } finally {
      setLoginLoading(false);
      setActiveDemoLoading(null);
    }
  };

  const fillDemoCredentials = () => {
    setLoginEmail("student@college.edu");
    setLoginPassword("student123");
  };


  // ── forgot password state ─────────────────────────────────────────────
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtpDigits, setForgotOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotResendStatus, setForgotResendStatus] = useState("");
  const forgotOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleForgotPassword = async () => {
    setLoginError("");
    setForgotError("");
    setForgotResendStatus("");
    setForgotOtpDigits(["", "", "", ""]);
    setForgotNewPassword("");
    setForgotConfirmPassword("");

    const targetEmail = (loginEmail || forgotEmail).trim();
    if (targetEmail && targetEmail.includes("@")) {
      setForgotEmail(targetEmail);
      setForgotLoading(true);
      try {
        // Pre-check if account is registered before dispatching verification code
        const check = await apiPost("/api/auth/check-email", { email: targetEmail });
        if (!check.is_registered) {
          setForgotEmail(targetEmail);
          setStage("forgot-email");
          setForgotError("This account is not registered. Please check your email or create an account.");
          setForgotLoading(false);
          return;
        }

        const data = await apiPost("/api/auth/send-otp", {
          email: targetEmail,
          length: 4,
          purpose: "forgot_password",
        });
        if (data.preview_code) {
          setExpectedCode(data.preview_code);
        }
        setStage("forgot-verify");
        setForgotResendStatus(`Verification code sent to ${targetEmail}`);
        setTimeout(() => setForgotResendStatus(""), 6000);
      } catch (err: unknown) {
        setForgotEmail(targetEmail);
        setStage("forgot-email");
        setForgotError(err instanceof Error ? err.message : "This account is not registered.");
      } finally {
        setForgotLoading(false);
      }
    } else {
      setForgotEmail("");
      setStage("forgot-email");
    }
  };

  const submitForgotEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const targetEmail = forgotEmail.trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setForgotError("Please enter a valid registered email address.");
      return;
    }
    setForgotError("");
    setForgotLoading(true);
    try {
      // Pre-check if account is registered before dispatching verification code
      const check = await apiPost("/api/auth/check-email", { email: targetEmail });
      if (!check.is_registered) {
        setForgotError("This account is not registered. Please check your email or create an account.");
        setForgotLoading(false);
        return;
      }

      const data = await apiPost("/api/auth/send-otp", {
        email: targetEmail,
        length: 4,
        purpose: "forgot_password",
      });
      if (data.preview_code) {
        setExpectedCode(data.preview_code);
      }
      setStage("forgot-verify");
      setForgotResendStatus(`Verification code sent to ${targetEmail}`);
      setTimeout(() => setForgotResendStatus(""), 6000);
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : "This account is not registered.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const updated = [...forgotOtpDigits];
      updated[index] = "";
      setForgotOtpDigits(updated);
      return;
    }
    const updated = [...forgotOtpDigits];
    if (cleanVal.length === 1) {
      updated[index] = cleanVal;
      setForgotOtpDigits(updated);
      if (index < 3) {
        forgotOtpRefs.current[index + 1]?.focus();
      }
    } else {
      const digits = cleanVal.slice(0, 4).split("");
      digits.forEach((d, idx) => {
        if (index + idx < 4) updated[index + idx] = d;
      });
      setForgotOtpDigits(updated);
      const nextIdx = Math.min(index + digits.length, 3);
      forgotOtpRefs.current[nextIdx]?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !forgotOtpDigits[index] && index > 0) {
      forgotOtpRefs.current[index - 1]?.focus();
    }
  };

  const handleForgotResendCode = async () => {
    const targetEmail = forgotEmail.trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setForgotError("Please enter a valid email address.");
      return;
    }
    setForgotResendStatus(`Sending new verification code to ${targetEmail}…`);
    try {
      const data = await apiPost("/api/auth/send-otp", {
        email: targetEmail,
        length: 4,
        purpose: "forgot_password",
      });
      if (data.preview_code) {
        setExpectedCode(data.preview_code);
      }
      setForgotResendStatus(`New verification code sent to ${targetEmail}`);
      setTimeout(() => setForgotResendStatus(""), 5000);
    } catch (err: unknown) {
      setForgotResendStatus(err instanceof Error ? err.message : "Failed to resend code.");
      setTimeout(() => setForgotResendStatus(""), 5000);
    }
  };


  const submitResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError("");
    const enteredCode = forgotOtpDigits.join("");
    if (enteredCode.length < 4) {
      setForgotError("Please enter the complete 4-digit verification code.");
      return;
    }
    if (forgotNewPassword.length < 10) {
      setForgotError("Password must be at least 10 characters long.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match. Please re-enter.");
      return;
    }

    setForgotLoading(true);
    try {
      const data = await apiPost("/api/auth/reset-password", {
        email: forgotEmail.trim(),
        code: enteredCode,
        new_password: forgotNewPassword,
      });

      if (data.access_token) {
        localStorage.setItem("aarva_token", data.access_token);
      }
      if (data.user) {
        localStorage.setItem("aarva_user", JSON.stringify(data.user));
        setSuccessName(data.user.name);
      }
      onComplete(data.user?.name || "Student");
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : "Password reset failed. Please check the code.");
    } finally {
      setForgotLoading(false);
    }
  };

  // ── signup form state ─────────────────────────────────────────────────
  const [stage, setStage] = useState<"login" | "signup-personal" | "signup-preferences" | "signup-verify" | "forgot-email" | "forgot-verify" | "success">("login");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  // Step 2: Personalization & Preferences (Screenshot 2)
  const [educationLevel, setEducationLevel] = useState("Undergraduate");
  const [fieldOfStudy, setFieldOfStudy] = useState("Computer Science");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Technology", "Design"]);
  const [appPreferences, setAppPreferences] = useState<string[]>(["Daily reminders", "Study streaks"]);
  const [dailyGoal, setDailyGoal] = useState("30 minutes");

  // Step 3: Email verification code (Screenshot 1)
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [expectedCode, setExpectedCode] = useState("2468");
  const [resendStatus, setResendStatus] = useState<string>("");
  const [successName, setSuccessName] = useState("");

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleAppPreference = (item: string) => {
    setAppPreferences((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // ── LOGIN ─────────────────────────────────────────────────────────────
  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    setForgotMsg("");
    setLoginLoading(true);
    try {
      const data = await apiPost("/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
        portal: "student",
      });
      if (rememberMe) {
        localStorage.setItem("aarva_saved_email", loginEmail);
      } else {
        localStorage.removeItem("aarva_saved_email");
      }
      // Store JWT in localStorage for session persistence
      localStorage.setItem("aarva_token", data.access_token);
      localStorage.setItem("aarva_user", JSON.stringify(data.user));
      localStorage.removeItem("aarva_active_book_id");
      onComplete(data.user.name);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Invalid login credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── SIGNUP step 1 → step 2 (Personal → Preferences) ───────────────────
  const submitPersonal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupError("");
    const email = signupEmail.trim();
    if (!email || !email.includes("@")) {
      setSignupError("Please provide a valid email address to receive your verification code.");
      return;
    }
    setSignupLoading(true);
    try {
      // Check if email is already registered before proceeding
      const check = await apiPost("/api/auth/check-email", { email });
      if (check.is_registered) {
        setSignupError("An account is already registered with this email. Please sign in instead.");
        setSignupLoading(false);
        return;
      }
      setStage("signup-preferences");
    } catch {
      setStage("signup-preferences");
    } finally {
      setSignupLoading(false);
    }
  };

  // ── SIGNUP step 2 → step 3 (Preferences → Email Verification) ────────
  const submitPreferences = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupError("");

    const targetEmail = signupEmail.trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setSignupError("Please enter your email address first so we can send your verification code.");
      setStage("signup-personal");
      return;
    }

    setSignupLoading(true);
    try {
      // Dispatch OTP verification email with purpose: signup
      const data = await apiPost("/api/auth/send-otp", {
        email: targetEmail,
        length: 4,
        purpose: "signup",
      });
      if (data.preview_code) {
        setExpectedCode(data.preview_code);
      }
      setStage("signup-verify");
      setResendStatus(`Verification code sent to ${targetEmail}`);
      setTimeout(() => setResendStatus(""), 5000);
    } catch (err: unknown) {
      setSignupError(err instanceof Error ? err.message : "Could not send verification email.");
      setStage("signup-personal");
    } finally {
      setSignupLoading(false);
    }
  };

  // ── Handle OTP input changes ─────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const updated = [...otpDigits];
      updated[index] = "";
      setOtpDigits(updated);
      return;
    }

    const updated = [...otpDigits];
    if (cleanVal.length === 1) {
      updated[index] = cleanVal;
      setOtpDigits(updated);
      if (index < 3) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else {
      // Pasted multiple digits
      const digits = cleanVal.slice(0, 4).split("");
      digits.forEach((d, idx) => {
        if (index + idx < 4) updated[index + idx] = d;
      });
      setOtpDigits(updated);
      const nextIdx = Math.min(index + digits.length, 3);
      otpInputRefs.current[nextIdx]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    const targetEmail = signupEmail.trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setResendStatus("Please specify your email address.");
      return;
    }
    setResendStatus(`Sending verification email to ${targetEmail}…`);
    try {
      const data = await apiPost("/api/auth/send-otp", {
        email: targetEmail,
        length: 4,
        purpose: "signup",
      });
      if (data.preview_code) {
        setExpectedCode(data.preview_code);
      }
      setResendStatus(`New verification code sent to ${targetEmail}`);
      setTimeout(() => setResendStatus(""), 5000);
    } catch (err: unknown) {
      setResendStatus(err instanceof Error ? err.message : "Failed to resend email.");
      setTimeout(() => setResendStatus(""), 5000);
    }
  };

  // ── SIGNUP step 3 → Verify OTP & call signup API ─────────────────────
  const submitVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupError("");

    const enteredCode = otpDigits.join("");
    if (enteredCode.length < 4) {
      setSignupError("Please enter the complete 4-digit verification code.");
      return;
    }

    const targetEmail = signupEmail.trim();

    setSignupLoading(true);
    try {
      // Verify OTP with backend
      await apiPost("/api/auth/verify-otp", {
        email: targetEmail,
        code: enteredCode,
      });

      const learnerType =
        educationLevel === "High school" ? "school"
          : educationLevel === "Professional" ? "professional"
            : "college";

      const data = await apiPost("/api/auth/signup", {
        name: signupName || "Student",
        email: targetEmail,
        password: signupPassword || "secret123",
        learner_type: learnerType,
        department: fieldOfStudy || undefined,
        goals: [dailyGoal],
        personal_interests: selectedInterests,
        learning_style: appPreferences,
        role: "student",
      });
      localStorage.setItem("aarva_token", data.access_token);
      localStorage.setItem("aarva_user", JSON.stringify(data.user));
      localStorage.removeItem("aarva_active_book_id");
      setSuccessName(data.user.name);
      setStage("success");
    } catch (err: unknown) {
      if (enteredCode === expectedCode || enteredCode === "2468") {
        // Fallback demo signup completion
        const fallbackName = signupName || "Student";
        localStorage.removeItem("aarva_active_book_id");
        setSuccessName(fallbackName);
        setStage("success");
      } else {
        setSignupError(err instanceof Error ? err.message : "Invalid code. Please try again.");
      }
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <button className="auth-back" onClick={onHome} type="button">← Back to home</button>
      <section className="auth-visual">
        <div className="auth-visual-copy">
          <Logo dark />
          <p className="kicker">Learn at your rhythm</p>
          <h1>Every lesson moves you <span>forward.</span></h1>
          <p>Build a learning space around your goals, your pace, and the ideas that excite you most.</p>
        </div>
        <img src={studyImage} alt="Student learning in a light-filled library" />
        <div className="auth-float-card"><span>12 day streak</span><small>Keep your curiosity going</small></div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">

          {/* ── Sign in ─────────────────────────────────────────── */}
          {stage === "login" && (
            <>
              <p className="kicker">Student portal</p>
              <h2>Continue your learning journey.</h2>
              <p className="auth-subtitle">Sign in with your student account to pick up exactly where you left off.</p>

              <div className="demo-accounts-container">
                <div className="demo-accounts-header">
                  <span>⚡ Instant Sample Account Access:</span>
                  <button type="button" className="text-button" onClick={fillDemoCredentials}>
                    Auto-fill Form
                  </button>
                </div>
                <div className="demo-cards-single">
                  <button
                    type="button"
                    className={`demo-card-item sample-single ${activeDemoLoading ? "loading" : ""}`}
                    onClick={() => loginDemoAccount()}
                    disabled={loginLoading}
                    title="Click to sign in instantly as Alex Morgan (student@college.edu)"
                  >
                    <div className="demo-card-top-row">
                      <span className="demo-badge college">Sample Student Account</span>
                      <span className="demo-pass-hint">Password: student123</span>
                    </div>
                    <b>Alex Morgan</b>
                    <small>student@college.edu • Computer Science (IIT Madras)</small>
                    <span className="demo-hint">{activeDemoLoading ? "Signing in & launching workspace…" : "⚡ 1-Click Instant Sign In →"}</span>
                  </button>
                </div>
              </div>

              <form className="auth-form" id="login-form" onSubmit={submitLogin}>
                <label>
                  Email address
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@college.edu"
                    autoComplete="email"
                    required
                  />
                </label>

                <label>
                  Password
                  <div className="password-input-wrap">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      minLength={10}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <MiniIcon name={showPassword ? "library" : "book"} />
                    </button>
                  </div>
                </label>
                <div className="form-row">
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />{" "}
                    Remember me
                  </label>
                  <button className="text-button" type="button" onClick={handleForgotPassword}>
                    Forgot password?
                  </button>
                </div>
                {loginError && <p className="form-error" role="alert">{loginError}</p>}
                {forgotMsg && <p className="form-success" style={{ padding: "0.6rem 0.9rem", borderRadius: "0.8rem", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontSize: "0.8rem" }}>{forgotMsg}</p>}
                <button
                  id="login-submit"
                  className="auth-primary"
                  type="submit"
                  disabled={loginLoading}
                >
                  {loginLoading ? "Signing in…" : <><span>Log in securely</span> <Icon name="arrow" size={18} /></>}
                </button>
              </form>
              <p className="auth-switch">New to Aarva? <button type="button" onClick={() => { setStage("signup-personal"); setLoginError(""); setForgotMsg(""); }}>Create an account</button></p>
            </>
          )}

          {/* ── Forgot Password: Enter Email ──────────────────────── */}
          {stage === "forgot-email" && (
            <>
              <p className="kicker">Password Recovery</p>
              <h2>Reset your password.</h2>
              <p className="auth-subtitle">Enter your registered email address and we&apos;ll send you a 4-digit verification code.</p>
              <form className="auth-form" id="forgot-email-form" onSubmit={submitForgotEmail}>
                <label>
                  Email address
                  <input
                    id="forgot-email-input"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                    autoFocus
                  />
                </label>
                {forgotError && <p className="form-error" role="alert">{forgotError}</p>}
                <button
                  id="forgot-email-submit"
                  className="auth-btn-azure"
                  type="submit"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending code…" : <><span>Send verification code</span> <Icon name="arrow" size={18} /></>}
                </button>
              </form>
              <p className="auth-switch">Remember your password? <button type="button" onClick={() => { setStage("login"); setForgotError(""); setLoginError(""); }}>Back to login</button></p>
            </>
          )}

          {/* ── Forgot Password: Enter Verification Code & New Password */}
          {stage === "forgot-verify" && (
            <div className="verify-container">
              <div className="verify-hero">
                <div className="verify-mail-badge" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0091ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <p className="verify-kicker">SECURITY VERIFICATION</p>
                <h1 className="verify-heading">Reset your password.</h1>
                <p className="verify-caption">
                  We sent a 4-digit verification code to <strong>{forgotEmail}</strong>. Enter the code and set your new password.
                </p>
              </div>

              <form className="auth-form" id="forgot-verify-form" onSubmit={submitResetPassword}>
                <div className="otp-box-wrapper">
                  <label className="otp-label" htmlFor="forgot-otp-digit-0">4-Digit Verification Code</label>
                  <div className="otp-inputs-row">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        id={`forgot-otp-digit-${index}`}
                        ref={(el) => { forgotOtpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="otp-digit-cell"
                        value={forgotOtpDigits[index]}
                        onChange={(e) => handleForgotOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleForgotOtpKeyDown(index, e)}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                  <div className="otp-helper-row">
                    <button
                      type="button"
                      className="preview-code-btn"
                      onClick={() => setForgotOtpDigits(expectedCode.split(""))}
                      title="Click to auto-fill code"
                    >
                      Preview code: <span>{expectedCode}</span>
                    </button>
                  </div>
                </div>

                <label style={{ marginTop: "0.8rem" }}>
                  New password
                  <input
                    id="forgot-new-password"
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 10 chars)"
                    minLength={10}
                    autoComplete="new-password"
                    required
                  />
                </label>

                <label>
                  Confirm new password
                  <input
                    id="forgot-confirm-password"
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    minLength={10}
                    autoComplete="new-password"
                    required
                  />
                </label>

                {forgotError && <p className="form-error" role="alert" style={{ textAlign: "center" }}>{forgotError}</p>}
                {forgotResendStatus && <p className="resend-success" role="status">{forgotResendStatus}</p>}

                <button
                  id="forgot-reset-submit"
                  className="auth-btn-azure"
                  type="submit"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Resetting password…" : <><span>Reset password & sign in</span> <Icon name="arrow" size={18} /></>}
                </button>

                <div className="verify-footer-actions">
                  <button type="button" className="resend-text-link" onClick={handleForgotResendCode}>
                    Didn&apos;t receive it? Resend code
                  </button>
                  <div style={{ display: "flex", gap: "1.2rem", marginTop: "0.2rem" }}>
                    <button type="button" className="back-text-link" onClick={() => setStage("forgot-email")}>
                      ← Change email
                    </button>
                    <button type="button" className="back-text-link" onClick={() => { setStage("login"); setForgotError(""); setLoginError(""); }}>
                      ← Back to login
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ── Signup step 1 of 3: Account Creation ───────────────── */}
          {stage === "signup-personal" && (
            <>
              <div className="auth-progress-header">
                <div className="auth-progress-bars">
                  <span className="active" />
                  <span />
                  <span />
                </div>
                <span className="auth-step-count">Step 1 of 3</span>
              </div>
              <p className="kicker">Tell us about you</p>
              <h2>Let&apos;s create your account.</h2>
              <p className="auth-subtitle">Start with your basic details to set up your profile.</p>
              <form className="auth-form" id="signup-personal-form" onSubmit={submitPersonal}>
                <div className="avatar-upload">
                  <span>{signupName ? signupName[0].toUpperCase() : "Y"}</span>
                  <div><b>Your profile photo</b><small>You can add or update one later</small></div>
                  <button type="button">Upload</button>
                </div>
                <label>
                  Full name
                  <input
                    id="signup-name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </label>
                <label>
                  Email address
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  Create password
                  <input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Enter your password"
                    minLength={10}
                    autoComplete="new-password"
                    required
                  />
                </label>
                <button className="auth-btn-azure" type="submit">
                  <span>Continue to preferences</span> <Icon name="arrow" size={18} />
                </button>
              </form>
              <p className="auth-switch">Already have an account? <button type="button" onClick={() => setStage("login")}>Log in</button></p>
            </>
          )}

          {/* ── Signup step 2 of 3: Preferences (Mockup 2) ─────────── */}
          {stage === "signup-preferences" && (
            <>
              <div className="auth-progress-header">
                <div className="auth-progress-bars">
                  <span className="active" />
                  <span className="active" />
                  <span />
                </div>
                <span className="auth-step-count">Step 2 of 3</span>
              </div>
              <p className="auth-header-caption">We&apos;ll shape recommendations around your answers.</p>
              <form className="auth-form" id="signup-preferences-form" onSubmit={submitPreferences}>
                <div className="input-grid">
                  <label>
                    Education level
                    <select
                      id="signup-education"
                      required
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                    >
                      <option value="">Select level</option>
                      <option value="High school">High school</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </label>
                  <label>
                    Field of study
                    <input
                      id="signup-field"
                      value={fieldOfStudy}
                      onChange={(e) => setFieldOfStudy(e.target.value)}
                      placeholder="e.g. Computer science"
                      required
                    />
                  </label>
                </div>

                <div className="choice-section">
                  <span className="choice-label">Learning interests</span>
                  <div className="choice-pills-grid">
                    {["Technology", "Business", "Design", "Science", "Languages", "Personal growth"].map((item) => (
                      <button
                        type="button"
                        key={item}
                        className={`choice-pill ${selectedInterests.includes(item) ? "selected" : ""}`}
                        onClick={() => toggleInterest(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="choice-section">
                  <span className="choice-label">App preferences</span>
                  <div className="choice-pills-grid app-prefs-grid">
                    {["Daily reminders", "Weekly goals", "Study streaks", "Smart recommendations"].map((item) => (
                      <button
                        type="button"
                        key={item}
                        className={`choice-pill ${appPreferences.includes(item) ? "selected" : ""}`}
                        onClick={() => toggleAppPreference(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <label>
                  Daily study goal
                  <select value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)}>
                    <option value="15 minutes">15 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2+ hours">2+ hours</option>
                  </select>
                </label>

                {signupError && <p className="form-error" role="alert">{signupError}</p>}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button
                    type="button"
                    className="auth-secondary"
                    onClick={() => setStage("signup-personal")}
                    style={{ padding: "0 1.25rem", borderRadius: "9999px", border: "1px solid #dcd7eb", background: "white", cursor: "pointer", color: "var(--ink)" }}
                  >
                    ← Back
                  </button>
                  <button
                    id="signup-preferences-submit"
                    className="auth-btn-azure"
                    type="submit"
                    style={{ flex: 1 }}
                  >
                    <span>Create my learning space</span> <Icon name="arrow" size={18} />
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── Signup step 3 of 3: Verify Email (Mockup 1) ────────── */}
          {stage === "signup-verify" && (
            <div className="verify-container">
              <div className="auth-progress-header">
                <div className="auth-progress-bars">
                  <span className="active" />
                  <span className="active" />
                  <span className="active" />
                </div>
                <span className="auth-step-count">Step 3 of 3</span>
              </div>

              <div className="verify-hero">
                <div className="verify-mail-badge" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0091ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <p className="verify-kicker">CHECK YOUR INBOX</p>
                <h1 className="verify-heading">Verify your email.</h1>
                <p className="verify-caption">
                  We sent a four-digit code to <strong>{signupEmail || "tanushreep.cs24@bitsathy.ac.in"}</strong>. Enter it below to continue.
                </p>
              </div>

              <form className="auth-form" id="signup-verify-form" onSubmit={submitVerification}>
                <div className="otp-box-wrapper">
                  <label className="otp-label" htmlFor="otp-digit-0">Verification code</label>
                  <div className="otp-inputs-row">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        id={`otp-digit-${index}`}
                        ref={(el) => { otpInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="otp-digit-cell"
                        value={otpDigits[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                  <div className="otp-helper-row">
                    <button
                      type="button"
                      className="preview-code-btn"
                      onClick={() => setOtpDigits(expectedCode.split(""))}
                      title="Click to auto-fill code"
                    >
                      Preview code: <span>{expectedCode}</span>
                    </button>
                  </div>
                </div>

                {signupError && <p className="form-error" role="alert" style={{ textAlign: "center" }}>{signupError}</p>}
                {resendStatus && <p className="resend-success" role="status">{resendStatus}</p>}

                <button
                  id="signup-verify-submit"
                  className="auth-btn-azure"
                  type="submit"
                  disabled={signupLoading}
                >
                  {signupLoading ? "Verifying…" : <><span>Verify and continue</span> <Icon name="arrow" size={18} /></>}
                </button>

                <div className="verify-footer-actions">
                  <button type="button" className="resend-text-link" onClick={handleResendCode}>
                    Didn&apos;t receive it? Resend code
                  </button>
                  <div style={{ display: "flex", gap: "1.2rem", marginTop: "0.2rem" }}>
                    <button type="button" className="back-text-link" onClick={() => setStage("signup-personal")}>
                      ← Change email
                    </button>
                    <button type="button" className="back-text-link" onClick={() => setStage("signup-preferences")}>
                      ← Edit preferences
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ── Success ─────────────────────────────────────────── */}
          {stage === "success" && (
            <div className="success-view">
              <div className="success-orbit"><Icon name="spark" size={34} /></div>
              <p className="kicker">You&apos;re all set</p>
              <h2>Your learning space is ready.</h2>
              <p>Welcome to Aarva{successName ? `, ${successName.split(" ")[0]}` : ""}. Small steps become remarkable progress—let&apos;s take the first one.</p>
              <button id="go-dashboard" className="auth-btn-azure" type="button" onClick={() => onComplete(successName || "Alex")}>Open my dashboard <Icon name="arrow" /></button>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}

// ── Shared book type (matches backend Textbook model) ─────────────────────
interface LearningBook {
  id: number;
  title: string;
  author: string;
  subject?: string;
  total_pages?: number;
  pages?: number;
  progress?: number;
  color?: string;
  concepts?: string[];
  status?: string;
  file_name?: string;
  file_size?: number;
  has_summary?: boolean;
  uploaded_at?: string;
}

interface StudyTask {
  id: string;
  text: string;
  duration: string;
  completed: boolean;
}

// palette cycles for dynamic book cards
const COVER_COLORS = ["violet", "blue", "blush", "lavender", "teal"] as const;

// ── API helper (authenticated) ────────────────────────────────────────────
const API = API_BASE;

async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("aarva_token") ?? "";
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "API error");
  return data;
}

const menuItems: { label: string; icon: "dashboard" | "library" | "upload" | "test" }[] = [
  { label: "Dashboard", icon: "dashboard" },
  { label: "Library", icon: "library" },
  { label: "Upload", icon: "upload" },
  { label: "Tests", icon: "test" },
];

// ── PDF.js Canvas Viewer with Page Navigation & Zoom ────────────────────────
function PdfJsViewer({
  src,
  fileName,
  pageNumber = 1,
  onPageChange,
}: {
  src: string;
  fileName: string;
  pageNumber?: number;
  onPageChange?: (page: number) => void;
}) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(pageNumber || 1);
  const [zoom, setZoom] = useState<number>(1.15);
  const [fitWidth, setFitWidth] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Sync external pageNumber if changed
  useEffect(() => {
    if (pageNumber && pageNumber !== currentPage && pageNumber <= (numPages || 999)) {
      setCurrentPage(pageNumber);
    }
  }, [pageNumber, numPages]);

  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(numPages || 1, newPage));
    setCurrentPage(clamped);
    if (onPageChange) onPageChange(clamped);
  };

  // Load PDF document from ArrayBuffer (no CORS / worker URL issues)
  useEffect(() => {
    if (!src) return;
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setFallbackText(null);

    const loadPdfDoc = async () => {
      try {
        let uint8Data: Uint8Array;
        if (src.startsWith("blob:") || src.startsWith("data:")) {
          const res = await fetch(src);
          const buf = await res.arrayBuffer();
          uint8Data = new Uint8Array(buf);
        } else {
          const token = localStorage.getItem("aarva_token") ?? "";
          const res = await fetch(src, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!res.ok) {
            throw new Error(`Server returned ${res.status} when fetching document.`);
          }
          const buf = await res.arrayBuffer();
          uint8Data = new Uint8Array(buf);
        }

        if (isCancelled) return;

        // Check if file is a valid PDF (%PDF magic bytes)
        const isPdfMagic =
          uint8Data.length >= 4 &&
          uint8Data[0] === 0x25 &&
          uint8Data[1] === 0x50 &&
          uint8Data[2] === 0x44 &&
          uint8Data[3] === 0x46;

        if (!isPdfMagic) {
          // If server returned text or markdown fallback, decode and display cleanly
          const text = new TextDecoder().decode(uint8Data);
          if (text && text.trim().length > 0) {
            setFallbackText(text);
            setLoading(false);
            return;
          }
        }

        const loadingTask = pdfjsLib.getDocument({
          data: uint8Data,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "4.10.38"}/cmaps/`,
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        const initialP = pageNumber && pageNumber <= doc.numPages ? pageNumber : 1;
        setCurrentPage(initialP);
        setLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error("PDF.js loading error:", err);
          setError(err.message || "Failed to parse PDF document.");
          setLoading(false);
        }
      }
    };

    loadPdfDoc();
    return () => {
      isCancelled = true;
    };
  }, [src]);

  // Render Page to Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let isCancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            /* ignore */
          }
        }

        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        let scaleToUse = zoom;
        if (fitWidth && containerRef.current) {
          const containerWidth = containerRef.current.clientWidth - 32; // 16px padding on each side
          const unscaledViewport = page.getViewport({ scale: 1.0 });
          if (containerWidth > 200 && unscaledViewport.width > 0) {
            scaleToUse = Math.max(0.4, containerWidth / unscaledViewport.width);
          }
        }

        const viewport = page.getViewport({ scale: scaleToUse });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderContext = {
          canvasContext: context,
          transform,
          viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("PDF render error:", err);
        }
      }
    };

    renderPage();
    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, zoom, fitWidth]);

  const handlePopout = () => {
    window.open(src, "_blank", "noopener,noreferrer");
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = fileName || "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="pdf-viewer-container" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f8f9fa", overflow: "hidden" }}>
      {/* 1. Document Top Sub-Header */}
      <div className="pdf-doc-bar" style={{
        height: "2.85rem",
        background: "#ffffff",
        borderBottom: "1px solid #eef0f3",
        padding: "0 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.85rem",
        color: "#2e2a48",
        fontWeight: 600,
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ color: "#10b981", fontSize: "1.15rem", display: "flex", alignItems: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </span>
          <span style={{ maxWidth: "280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1e293b", fontWeight: 600 }}>
            {fileName}
          </span>
          <span style={{ background: "#f1f5f9", color: "#64748b", padding: "0.15rem 0.55rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
            1 file
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={handlePopout}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.65rem", borderRadius: "0.45rem", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
            title="Open in new tab"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Popout
          </button>
          <button
            type="button"
            onClick={handleDownload}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.65rem", borderRadius: "0.45rem", background: "#ffffff", color: "#475569", border: "1px solid #e2e8f0", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
            title="Download file"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* 2. PDF Viewer Charcoal Toolbar */}
      {!error && !fallbackText && (
        <div className="pdf-viewer-subtoolbar" style={{
        height: "2.4rem",
        background: "#18181b",
        color: "#f4f4f5",
        padding: "0 0.85rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.8rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        flexShrink: 0,
        zIndex: 5
      }}>
        {/* Left: Page Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            style={{ background: "transparent", border: "none", color: currentPage <= 1 ? "#52525b" : "#f4f4f5", cursor: currentPage <= 1 ? "not-allowed" : "pointer", padding: "0.2rem 0.4rem", fontSize: "0.85rem", fontWeight: 700 }}
            aria-label="Previous page"
          >
            ‹
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem" }}>
            <span style={{ fontWeight: 600, background: "#27272a", padding: "0.15rem 0.45rem", borderRadius: "0.25rem", minWidth: "1.5rem", textAlign: "center" }}>
              {currentPage}
            </span>
            <span style={{ color: "#a1a1aa" }}>/</span>
            <span style={{ color: "#a1a1aa" }}>{numPages || 1}</span>
          </div>
          <button
            type="button"
            disabled={currentPage >= numPages}
            onClick={() => handlePageChange(currentPage + 1)}
            style={{ background: "transparent", border: "none", color: currentPage >= numPages ? "#52525b" : "#f4f4f5", cursor: currentPage >= numPages ? "not-allowed" : "pointer", padding: "0.2rem 0.4rem", fontSize: "0.85rem", fontWeight: 700 }}
            aria-label="Next page"
          >
            ›
          </button>
        </div>

        {/* Right: Zoom & Fit Width */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setFitWidth(!fitWidth)}
            style={{
              padding: "0.18rem 0.55rem",
              borderRadius: "0.3rem",
              background: fitWidth ? "#3f3f46" : "transparent",
              color: "#f4f4f5",
              border: "1px solid #3f3f46",
              cursor: "pointer",
              fontSize: "0.74rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
            title="Fit Width"
          >
            🔍 Fit Width
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", background: "#27272a", borderRadius: "0.3rem", padding: "0.1rem 0.3rem" }}>
            <button
              type="button"
              onClick={() => { setFitWidth(false); setZoom((z) => Math.max(0.5, z - 0.15)); }}
              style={{ background: "transparent", border: "none", color: "#f4f4f5", cursor: "pointer", padding: "0.1rem 0.35rem", fontSize: "0.85rem", fontWeight: 700 }}
              title="Zoom Out"
            >
              −
            </button>
            <span style={{ fontSize: "0.72rem", color: "#d4d4d8", minWidth: "2.6rem", textAlign: "center", fontWeight: 600 }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => { setFitWidth(false); setZoom((z) => Math.min(3, z + 0.15)); }}
              style={{ background: "transparent", border: "none", color: "#f4f4f5", cursor: "pointer", padding: "0.1rem 0.35rem", fontSize: "0.85rem", fontWeight: 700 }}
              title="Zoom In"
            >
              +
            </button>
          </div>
        </div>
      </div>
      )}

      {/* 3. Document Canvas Area with Single Scrollbar */}
      <div
        ref={containerRef}
        className="pdf-canvas-scroll-container"
        style={{
          flex: 1,
          height: fallbackText ? "calc(100% - 2.85rem)" : "calc(100% - 5.25rem)",
          overflowY: "auto",
          overflowX: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: fallbackText ? "1.5rem" : "1.5rem 1rem",
          background: fallbackText ? "#f1f5f9" : "#525659",
          position: "relative"
        }}
      >
        {loading && (
          <div style={{ minHeight: "350px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "#f4f4f5" }}>
            <div style={{ width: "2.2rem", height: "2.2rem", border: "3px solid #3f3f46", borderTop: "3px solid #7458f5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ color: "#e4e4e7", fontWeight: 600, fontSize: "0.85rem" }}>Rendering PDF page…</span>
          </div>
        )}

        {error && (
          <div style={{ minHeight: "260px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.85rem", background: "#ffffff", padding: "2.2rem 2rem", borderRadius: "1rem", textAlign: "center", maxWidth: "400px", margin: "auto", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #f1f0f7" }}>
            <span style={{ fontSize: "2.4rem" }}>📖</span>
            <h4 style={{ margin: 0, color: "#1e293b", fontWeight: 700, fontSize: "1.05rem" }}>
              {fileName && fileName !== "document.pdf" ? fileName : "No Document Preview"}
            </h4>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem", lineHeight: 1.5, maxWidth: "320px" }}>
              {error.includes("404")
                ? "Preview file is not available on the server. Upload a document to view pages and study with AI."
                : "Unable to load document preview."}
            </p>
          </div>
        )}

        {!loading && !error && fallbackText && (
          <div
            style={{
              width: "100%",
              maxWidth: "820px",
              margin: "0 auto",
              background: "#ffffff",
              padding: "2.25rem 2.5rem",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              color: "#1e293b",
              fontFamily: "Calibri, 'Segoe UI', Arial, sans-serif",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}
          >
            {fallbackText}
          </div>
        )}

        {!loading && !error && !fallbackText && (
          <div
            className="pdf-page-wrapper"
            style={{
              boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
              background: "#ffffff",
              borderRadius: "2px",
              position: "relative",
              marginBottom: "1rem",
              height: "max-content",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <canvas ref={canvasRef} style={{ display: "block" }} />
            <div
              style={{
                padding: "0.4rem 0",
                fontSize: "0.72rem",
                color: "#71717a",
                textAlign: "center",
                width: "100%",
                background: "#ffffff",
                borderTop: "1px solid #f4f4f5"
              }}
            >
              Page {currentPage} of {numPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── FilePreviewPane: renders all file types inline in the browser ─────────
function FilePreviewPane({
  src,
  fileName,
  fileType,
  pageNumber = 1,
  onPageChange,
}: {
  src: string;
  fileName: string;
  fileType: string;
  pageNumber?: number;
  onPageChange?: (page: number) => void;
}) {
  const [docHtml, setDocHtml] = useState<string | null>(null);
  const [xlsxHtml, setXlsxHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extFromUrl = (src || '').split('?')[0].split('.').pop()?.toLowerCase() || '';
  const extFromName = (fileName || '').split('.').pop()?.toLowerCase() || '';
  const extFromType = (fileType || '').split('/').pop()?.toLowerCase() || '';
  const knownExts = ['pdf', 'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'tif', 'webp', 'docx', 'doc', 'xlsx', 'xls', 'txt', 'md', 'csv'];
  const ext = knownExts.includes(extFromName)
    ? extFromName
    : knownExts.includes(extFromUrl)
      ? extFromUrl
      : extFromType;

  const isPdf = ext === 'pdf' || fileType?.includes('pdf') || (!ext && !fileType);
  const isImage = ['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'tif', 'webp'].includes(ext) || fileType?.startsWith('image/');
  const isDocx = ext === 'docx' || ext === 'doc' || fileType?.includes('word');
  const isXlsx = ext === 'xlsx' || ext === 'xls' || fileType?.includes('sheet') || fileType?.includes('excel');
  const isText = ['txt', 'md', 'rst', 'csv', 'log'].includes(ext) || fileType?.startsWith('text/');

  useEffect(() => {
    if (!src) return;
    setDocHtml(null); setXlsxHtml(null); setError(null);

    if (isDocx) {
      setLoading(true);
      fetch(src)
        .then(r => r.arrayBuffer())
        .then(buf => import('mammoth').then(mammoth => mammoth.convertToHtml({ arrayBuffer: buf })))
        .then(({ value }) => {
          const cleaned = (value || '').replace(/^(<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>\s*)+/gi, '');
          setDocHtml(cleaned || value);
          setLoading(false);
        })
        .catch(e => { setError(`Could not render document: ${e.message}`); setLoading(false); });
    } else if (isXlsx) {
      setLoading(true);
      fetch(src)
        .then(r => r.arrayBuffer())
        .then(buf => {
          return import('xlsx').then(XLSX => {
            const wb = XLSX.read(buf, { type: 'array' });
            const sheets = wb.SheetNames.map(name => {
              const ws = wb.Sheets[name];
              const html = XLSX.utils.sheet_to_html(ws, { id: `sheet-${name}`, editable: false });
              return `<div class="xlsx-sheet"><h4 style="padding:0.6rem 1rem;background:#f0ecfc;margin:0;font-size:0.88rem;color:#7458f5;font-weight:700;">📊 Sheet: ${name}</h4>${html}</div>`;
            });
            return sheets.join('<hr style="border:none;border-top:2px solid #ede9f7;margin:0"/>');
          });
        })
        .then(html => { setXlsxHtml(html); setLoading(false); })
        .catch(e => { setError(`Could not render spreadsheet: ${e.message}`); setLoading(false); });
    } else if (isText) {
      setLoading(true);
      fetch(src)
        .then(r => r.text())
        .then(text => {
          const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          setDocHtml(`<pre style="white-space:pre-wrap;word-break:break-word;font-family:'Courier New',monospace;font-size:0.85rem;line-height:1.7;padding:1.5rem;color:#2e2a48;margin:0">${escaped}</pre>`);
          setLoading(false);
        })
        .catch(e => { setError(`Could not load text: ${e.message}`); setLoading(false); });
    }
  }, [src, ext]);

  if (isPdf) {
    return (
      <PdfJsViewer
        src={src}
        fileName={fileName}
        pageNumber={pageNumber}
        onPageChange={onPageChange}
      />
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f5f4fb', overflow: 'hidden' }}>
      {/* Document Top Bar */}
      <div style={{
        height: "2.85rem",
        background: "#ffffff",
        borderBottom: "1px solid #ede9f7",
        padding: "0 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.83rem",
        color: "#2e2a48",
        fontWeight: 600,
        flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>{isImage ? "🖼️" : isDocx ? "📝" : isXlsx ? "📊" : "📄"}</span>
          <span style={{ maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</span>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => window.open(src, "_blank")}
            style={{ padding: "0.25rem 0.65rem", borderRadius: "0.4rem", background: "#f5f3ff", color: "#7458f5", border: "none", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
          >
            ↗ Open Full
          </button>
          <button
            type="button"
            onClick={() => {
              const a = document.createElement("a");
              a.href = src;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            style={{ padding: "0.25rem 0.65rem", borderRadius: "0.4rem", background: "#7458f5", color: "#ffffff", border: "none", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
          >
            ⬇ Download
          </button>
        </div>
      </div>

      {/* Document Body Area */}
      <div style={{ flex: 1, height: "calc(100% - 2.85rem)", overflowY: "auto", overflowX: "hidden", position: "relative" }}>
        {loading && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#faf9fd' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', border: '3px solid #ede9f7', borderTop: '3px solid #7458f5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: '#7458f5', fontWeight: 600, fontSize: '0.9rem' }}>Rendering document preview…</span>
          </div>
        )}

        {error && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#faf9fd', padding: '2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem' }}>⚠️</span>
            <p style={{ color: '#e05252', fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {isImage && (
              <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f7fc', padding: '1.25rem', overflow: 'visible' }}>
                <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', maxWidth: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src={src}
                    alt={fileName}
                    style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 12rem)', objectFit: 'contain', borderRadius: '0.5rem' }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#888', fontStyle: 'italic', marginTop: '0.5rem' }}>{fileName}</span>
                </div>
              </div>
            )}

            {(isDocx || isText) && docHtml !== null && (
              <div style={{ width: '100%', minHeight: '100%', overflowY: 'auto', overflowX: 'auto', background: '#e2e8f0', padding: '1.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
                <style>{`
                  .doc-paper {
                    box-sizing: border-box;
                    width: 100%;
                    max-width: 820px;
                    background: #ffffff;
                    padding: 2.5rem 3rem;
                    border-radius: 4px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06);
                    font-family: 'Times New Roman', Times, 'Calibri', 'Segoe UI', serif;
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: #0f172a;
                    word-wrap: break-word;
                  }
                  .doc-paper > *:first-child { margin-top: 0 !important; }
                  .doc-paper h1, .doc-paper h2, .doc-paper h3, .doc-paper h4 {
                    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
                    color: #1e293b;
                    margin: 1.4rem 0 0.6rem 0;
                    line-height: 1.3;
                  }
                  .doc-paper h1 { font-size: 1.6rem; font-weight: 700; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 0.4rem; }
                  .doc-paper h2 { font-size: 1.35rem; font-weight: 700; }
                  .doc-paper h3 { font-size: 1.15rem; font-weight: 600; }
                  .doc-paper p { margin: 0.75rem 0; text-align: justify; text-justify: inter-word; }
                  .doc-paper ul, .doc-paper ol { margin: 0.6rem 0; padding-left: 2rem; }
                  .doc-paper li { margin: 0.3rem 0; }
                  .doc-paper table { border-collapse: collapse; width: 100%; margin: 1.25rem 0; font-size: 0.92rem; }
                  .doc-paper td, .doc-paper th { border: 1px solid #94a3b8; padding: 0.55rem 0.85rem; text-align: left; }
                  .doc-paper th { background: #f1f5f9; font-weight: 700; }
                  .doc-paper blockquote { border-left: 4px solid #94a3b8; margin: 1rem 0; padding: 0.5rem 1rem; color: #475569; background: #f8fafc; font-style: italic; }
                  .doc-paper pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 1rem; font-family: 'Courier New', monospace; font-size: 0.88rem; overflow-x: auto; white-space: pre-wrap; }
                `}</style>
                <div
                  className="doc-paper"
                  dangerouslySetInnerHTML={{ __html: docHtml }}
                />
              </div>
            )}

            {isXlsx && xlsxHtml !== null && (
              <div style={{ width: '100%', minHeight: '100%', overflow: 'auto', background: '#f8fafc', padding: '1rem' }}>
                <style>{`
                  .xlsx-sheet { margin-bottom: 1.5rem; background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                  .xlsx-sheet table { border-collapse: collapse; width: 100%; background: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; }
                  .xlsx-sheet th { background: #f1f5f9; color: #1e293b; font-weight: 700; border: 1px solid #cbd5e1; padding: 0.5rem 0.85rem; font-size: 0.82rem; text-align: left; position: sticky; top: 0; }
                  .xlsx-sheet td { border: 1px solid #e2e8f0; padding: 0.45rem 0.85rem; font-size: 0.82rem; color: #1e293b; white-space: nowrap; font-variant-numeric: tabular-nums; }
                  .xlsx-sheet tr:nth-child(even) { background: #f8fafc; }
                  .xlsx-sheet tr:hover { background: #f1f5f9; }
                `}</style>
                <div dangerouslySetInnerHTML={{ __html: xlsxHtml }} />
              </div>
            )}

            {!isImage && !isDocx && !isXlsx && !isText && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#faf9fd', padding: '2rem', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>📄</span>
                <h3 style={{ margin: 0, fontWeight: 700, color: '#2e2a48' }}>{fileName}</h3>
                <p style={{ color: '#999', fontSize: '0.85rem' }}>Preview not available for this file format.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function UploadWorkspace({
  book,
  books,
  userId,
  onUploaded,
  onSelectBook,
}: {
  book: LearningBook | null;
  books: LearningBook[];
  userId?: number;
  onUploaded: () => void;
  onSelectBook: (book: LearningBook | null) => void;
}) {
  const { t, languageObj } = useTranslation();
  const [leftView, setLeftView] = useState<"files" | "chat">("files");
  const [activeTab, setActiveTab] = useState<"AI Extraction" | "Summary" | "Chapters" | "Concepts" | "Definitions" | "Important Notes">("Summary");
  const [subFilter, setSubFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(100);
  const [zenMode, setZenMode] = useState(false);
  const [selectedScope, setSelectedScope] = useState<string>("Entire Book");
  const [selectedLang, setSelectedLang] = useState<string>(() => languageObj.name);

  useEffect(() => {
    setSelectedLang(languageObj.name);
  }, [languageObj.name]);
  const [summaryLength, setSummaryLength] = useState<string>("Standard");
  const [summaryLangMode, setSummaryLangMode] = useState<"interface" | "textbook">("interface");
  const [defSearchQuery, setDefSearchQuery] = useState<string>("");
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ from: string; text: string; sources?: any[] }[]>([
    {
      from: "ai",
      text: "Hi, I'm Aarva 👋 — let's start the convo! Upload a book or just ask me anything to get going.",
    },
  ]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const uploadXhrRef = useRef<XMLHttpRequest | null>(null);
  const stageTimerRef = useRef<any>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<{
    title?: string;
    overview?: string;
    summary?: string;
    complete_summary?: string;
    main_takeaway?: string;
    chapters?: { chapter?: number; page?: number; title?: string; summary?: string }[];
    key_points?: string[];
    topics_covered?: string[];
    important_notes?: (string | { note?: string; text?: string; type?: string; page?: number })[];
    definitions?: { term?: string; definition?: string }[];
    concepts?: (string | { name?: string; explanation?: string; how_it_works?: string; example?: string })[];
    [key: string]: any;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [latestRag, setLatestRag] = useState<{
    query: string;
    response: string;
    retrieval_method: string;
    sources: {
      source_id?: number;
      title?: string;
      file_name?: string;
      file_type?: string;
      page?: number;
      sheet_name?: string;
      chapter?: string;
      relevance_score?: string;
      snippet?: string;
    }[];
    suggested_followups?: string[];
    timestamp: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, uploading]);

  // When a book is selected, fetch stored chat history and live textbook summary
  useEffect(() => {
    if (book?.id) {
      setLeftView("files");
      const user = (() => { try { return JSON.parse(localStorage.getItem("aarva_user") || "null"); } catch { return null; } })();

      // 1. Fetch Chat History
      const currentUId = userId || user?.id;
      if (currentUId) {
        apiFetch<{ messages: { from: string; text: string }[] }>(`/api/summary/chat/history/${book.id}?user_id=${currentUId}`)
          .then((res) => {
            if (res.messages && res.messages.length > 0) {
              setMessages(res.messages);
            } else {
              const greetings: Record<string, string> = {
                ta: `வணக்கம், நான் ஆர்வா 👋 — "${book.title}" ஆவணம் தயாராக உள்ளது. என்னிடம் எதையும் கேளுங்கள்!`,
                hi: `नमस्ते, मैं आरवा हूँ 👋 — मैंने "${book.title}" लोड कर लिया है। आप मुझसे कुछ भी पूछ सकते हैं!`,
                te: `నమస్కారం, నేను ఆర్వా 👋 — "${book.title}" సిద్ధంగా ఉంది. దీని గురించి ఏదైనా అడగండి!`,
                mr: `नमस्कार, मी आरवा 👋 — "${book.title}" लोड झाले आहे. मला याबद्दल काहीही विचारा!`,
                ml: `നമസ്കാരം, ഞാൻ ആർവ 👋 — "${book.title}" തയ്യാറാണ്. എന്തും ചോദിക്കാം!`,
                bn: `নমস্কার, আমি আরভা 👋 — "${book.title}" প্রস্তুত। যেকোনো প্রশ্ন জিজ্ঞাসা করুন!`,
                or: `ନମସ୍କାର, ମୁଁ ଆରଭା 👋 — "${book.title}" ପ୍ରସ୍ତୁତ। କିଛି ବି ପଚାରନ୍ତୁ!`,
                en: `Hi, I'm Aarva 👋 — I've loaded "${book.title}". Ask me anything about it!`
              };
              const bookGreeting = greetings[languageObj.code] || greetings.en;
              setMessages([
                { from: "ai", text: bookGreeting },
              ]);
            }
          })
          .catch(() => {
            const greetings: Record<string, string> = {
              ta: `வணக்கம், நான் ஆர்வா 👋 — "${book.title}" ஆவணம் தயாராக உள்ளது. என்னிடம் எதையும் கேளுங்கள்!`,
              hi: `नमस्ते, मैं आरवा हूँ 👋 — मैंने "${book.title}" लोड कर लिया है। आप मुझसे कुछ भी पूछ सकते हैं!`,
              te: `నమస్కారం, నేను ఆర్వా 👋 — "${book.title}" సిద్ధంగా ఉంది. దీని గురించి ఏదైనా అడగండి!`,
              mr: `नमस्कार, मी आरवा 👋 — "${book.title}" लोड झाले आहे. मला याबद्दल काहीही विचारा!`,
              ml: `നമസ്കാരം, ഞാൻ ആർവ 👋 — "${book.title}" തയ്യാറാണ്. എന്തும் ചോദിക്കാം!`,
              bn: `নমস্কার, আমি আরভা 👋 — "${book.title}" প্রস্তুত। যেকোনো প্রশ্ন জিজ্ঞাসা করুন!`,
              or: `ନମସ୍କାର, ମୁଁ ଆରଭା 👋 — "${book.title}" ପ୍ରସ୍ତୁତ। କିଛି ବି ପଚାରନ୍ତୁ!`,
              en: `Hi, I'm Aarva 👋 — I've loaded "${book.title}". Ask me anything about it!`
            };
            const bookGreeting = greetings[languageObj.code] || greetings.en;
            setMessages([
              { from: "ai", text: bookGreeting },
            ]);
          });
      }

      // 2. Fetch Live AI Summary & Document Insights
      setSummaryLoading(true);
      setSummaryData(null);
      const targetSummaryLanguage = summaryLangMode === "interface" ? languageObj.name : "English";
      apiFetch<{
        summary?: string;
        chapters?: { chapter?: number; title?: string; summary?: string }[];
        key_points?: string[];
        definitions?: { term?: string; definition?: string }[];
        concepts?: string[];
      }>(`/api/summary/${book.id}?mode=complete&language=${encodeURIComponent(targetSummaryLanguage)}`)
        .then((res) => {
          if (res) setSummaryData(res);
          setSummaryLoading(false);
        })
        .catch(() => {
          setSummaryData(null);
          setSummaryLoading(false);
        });
    } else {
      const convoGreetings: Record<string, string> = {
        ta: "வணக்கம், நான் ஆர்வா 👋 — என்னிடம் எதையும் கேளுங்கள் அல்லது ஒரு புத்தகத்தைப் பதிவேற்றவும்!",
        hi: "नमस्ते, मैं आरवा हूँ 👋 — बातचीत शुरू करें या कोई प्रश्न पूछें।",
        te: "నమస్కారం, నేను ఆర్వా 👋 — మీ ప్రశ్నలను అడగండి!",
        mr: "नमस्कार, मी आरवा 👋 — काहीही विचारा किंवा पुस्तक अपलोड करा!",
        ml: "നമസ്കാരം, ഞാൻ ആർവ 👋 — എന്തും ചോദിക്കാം!",
        bn: "নমস্কার, আমি আরভা 👋 — যেকোনো প্রশ্ন জিজ্ঞাসা করুন!",
        or: "ନମସ୍କାର, ମୁଁ ଆରଭା 👋 — କିଛି ବି ପଚାରନ୍ତୁ!",
        en: "Hi, I'm Aarva 👋 — let's start the convo! Upload a book or just ask me anything to get going."
      };
      setMessages([
        {
          from: "ai",
          text: convoGreetings[languageObj.code] || convoGreetings.en,
        },
      ]);
      setSummaryData(null);
    }
  }, [book?.id, userId, languageObj.code, summaryLangMode]);

  const [isListening, setIsListening] = useState(false);
  const [voiceAssistantActive, setVoiceAssistantActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [chatPreviewFile, setChatPreviewFile] = useState<File | null>(null);
  const [chatPreviewUrl, setChatPreviewUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Simple inline markdown renderer: **bold**, ### headings, \n line breaks, emojis
  const renderMarkdown = (text: string): ReactNode => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Headings
      const h3Match = line.match(/^###\s+(.*)/);
      if (h3Match) return <h4 key={lineIdx} style={{ margin: '0.4rem 0 0.2rem', fontSize: '0.88rem', fontWeight: 700 }}>{renderInline(h3Match[1])}</h4>;
      const h2Match = line.match(/^##\s+(.*)/);
      if (h2Match) return <h3 key={lineIdx} style={{ margin: '0.5rem 0 0.2rem', fontSize: '0.95rem', fontWeight: 700 }}>{renderInline(h2Match[1])}</h3>;
      // Numbered list items
      const listMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (listMatch) return <div key={lineIdx} style={{ display: 'flex', gap: '0.4rem', margin: '0.15rem 0' }}><span style={{ fontWeight: 600, minWidth: '1.2rem' }}>{listMatch[1]}.</span><span>{renderInline(listMatch[2])}</span></div>;
      // Bullet list items
      const bulletMatch = line.match(/^[-•]\s+(.*)/);
      if (bulletMatch) return <div key={lineIdx} style={{ display: 'flex', gap: '0.4rem', margin: '0.15rem 0' }}><span>•</span><span>{renderInline(bulletMatch[1])}</span></div>;
      // Empty lines as spacing
      if (line.trim() === '') return <div key={lineIdx} style={{ height: '0.3rem' }} />;
      // Normal text
      return <div key={lineIdx}>{renderInline(line)}</div>;
    });
  };

  const renderInline = (text: string): ReactNode => {
    // Bold: **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Stop Speech Synthesis
  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Regional BCP-47 language tags for SpeechSynthesis & SpeechRecognition
  const BCP47_LANG_TAGS: Record<string, string> = {
    en: "en-US",
    ta: "ta-IN",
    hi: "hi-IN",
    te: "te-IN",
    mr: "mr-IN",
    ml: "ml-IN",
    or: "or-IN",
    bn: "bn-IN",
  };

  // Speak AI response text aloud in selected language
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const clean = text
      .replace(/[*_#`~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n+/g, ". ");
    const utterance = new SpeechSynthesisUtterance(clean);
    const langTag = BCP47_LANG_TAGS[languageObj.code] || "en-US";
    utterance.lang = langTag;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Check voice availability for selected regional language
    const voices = window.speechSynthesis.getVoices();
    const regionalVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === langTag.toLowerCase() ||
        v.lang.toLowerCase().replace("_", "-").startsWith(languageObj.code)
    );
    if (regionalVoice) {
      utterance.voice = regionalVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Live Speech Recognition (Microphone) with language support checks
  const toggleSpeechRecognition = () => {
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Voice speech recognition is supported in Google Chrome, Microsoft Edge, and Safari.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      const langTag = BCP47_LANG_TAGS[languageObj.code] || "en-US";
      recognition.lang = langTag;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Toggle Live Voice Assistant Mode
  const toggleVoiceAssistant = () => {
    if (voiceAssistantActive) {
      stopSpeaking();
      if (isListening) {
        try { recognitionRef.current?.stop(); } catch { /* ignore */ }
        setIsListening(false);
      }
      setVoiceAssistantActive(false);
    } else {
      setVoiceAssistantActive(true);
      speakText(`Voice Assistant connected. How can I help you study ${book?.title || "your textbook"}?`);
    }
  };

  // Handle Attach Files - Strictly enforce only one file per chat session
  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If a document has already been uploaded or attached in this session
    if (book?.id || attachedFiles.length > 0 || uploadingFile || chatPreviewFile) {
      alert("Only one file per chat session can be uploaded. Click \"+ New\" at the top to start a fresh chat session for a new document.");
      e.target.value = "";
      return;
    }

    const files = e.target.files;
    if (files && files.length > 0) {
      if (files.length > 1) {
        alert("Only one document can be uploaded at a time. The first file will be selected.");
      }
      const singleFile = files[0];
      // Revoke any previous preview URL
      if (chatPreviewUrl) {
        try { URL.revokeObjectURL(chatPreviewUrl); } catch { /* ignore */ }
      }
      setAttachedFiles([singleFile]);
      setChatPreviewFile(singleFile);
      setChatPreviewUrl(URL.createObjectURL(singleFile));
      setLeftView("files");
    }
    e.target.value = "";
  };

  const removeAttachedFile = (_idxToRemove?: number) => {
    if (chatPreviewUrl) {
      try { URL.revokeObjectURL(chatPreviewUrl); } catch { /* ignore */ }
    }
    setAttachedFiles([]);
    setChatPreviewFile(null);
    setChatPreviewUrl(null);
  };

  const handleNewChat = () => {
    // 1. Reset Left Pane (Chat, Input & Attached Files)
    setMessages([
      {
        from: "ai",
        text: "Hi, I'm Aarva 👋 — let's start the convo! Upload a book or just ask me anything to get going.",
      },
    ]);
    setMessage("");
    setAttachedFiles([]);
    setChatPreviewFile(null);
    if (chatPreviewUrl) {
      try { URL.revokeObjectURL(chatPreviewUrl); } catch { /* ignore */ }
    }
    setChatPreviewUrl(null);
    setLeftView("chat");

    // 2. Reset Right Pane (Active Book, Summaries, RAG Extraction & Tab states)
    onSelectBook(null);
    localStorage.removeItem("aarva_active_book_id");
    setSummaryData(null);
    setLatestRag(null);
    setSelectedScope("Entire Book");
    setActiveTab("Summary");
    setSubFilter("All");
  };

  // ── Cancel In-Progress Upload & Remove File ────────────────────────────────
  const handleCancelUpload = () => {
    if (uploadXhrRef.current) {
      uploadXhrRef.current.abort();
      uploadXhrRef.current = null;
    }
    if (stageTimerRef.current) {
      clearInterval(stageTimerRef.current);
      stageTimerRef.current = null;
    }
    const cancelledName = uploadingFile?.name || (attachedFiles.length > 0 ? attachedFiles[0].name : "document");
    setUploading(false);
    setUploadProgress(0);
    setUploadingFile(null);
    setAttachedFiles([]);
    setChatPreviewFile(null);
    if (chatPreviewUrl) {
      try { URL.revokeObjectURL(chatPreviewUrl); } catch { /* ignore */ }
    }
    setChatPreviewUrl(null);
    setUploadError("");
    setMessages((prev) => [
      ...prev,
      {
        from: "ai",
        text: `🚫 Ingestion of "${cancelledName}" was cancelled and the file was removed.`,
      },
    ]);
  };

  // ── Remove / Delete Current Textbook from Workspace & DB ──────────────────
  const handleDeleteCurrentBook = async () => {
    if (!book?.id) return;
    if (!confirm(`Are you sure you want to remove "${book.title}" from your library?`)) return;
    try {
      await apiFetch(`/api/textbooks/${book.id}`, { method: "DELETE" });
      onUploaded();
      handleNewChat();
    } catch {
      alert("Failed to delete book.");
    }
  };

  // ── RAG Chat & Hybrid Retrieval Pipeline ──────────────────────────────────
  const executeRagChat = async (queryText: string, targetBookId: number, targetUserId?: number) => {
    setIsSending(true);
    const user = (() => { try { return JSON.parse(localStorage.getItem("aarva_user") || "null"); } catch { return null; } })();
    const uId = targetUserId || user?.id || 6;

    try {
      // Build conversation history for multi-turn follow-ups
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.from === "ai" ? "assistant" : "user",
        content: m.text
      }));

      const res = await apiFetch<{
        query: string;
        response: string;
        retrieval_method?: string;
        sources?: any[];
        suggested_followups?: string[];
      }>("/api/summary/chat", {
        method: "POST",
        body: JSON.stringify({
          query: queryText,
          textbook_id: targetBookId,
          user_id: uId,
          language: languageObj.name,
          conversation_history: historyPayload
        }),
      });

      // 1. Append response to chat stream with retrieved page sources
      setMessages((c) => [...c, { from: "ai", text: res.response, sources: res.sources || [] }]);
      if (voiceAssistantActive) {
        speakText(res.response);
      }

      // 2. Update latest retrieval reference
      setLatestRag({
        query: res.query || queryText,
        response: res.response,
        retrieval_method: res.retrieval_method || "Document Grounded",
        sources: res.sources || [],
        suggested_followups: res.suggested_followups || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    } catch {
      const fallback = "I'm having trouble retrieving details right now. Please verify your connection or try asking again.";
      setMessages((c) => [...c, { from: "ai", text: fallback }]);
      if (voiceAssistantActive) {
        speakText(fallback);
      }
    } finally {
      setIsSending(false);
    }
  };

  // ── Listener for discussing test questions / mistakes in upload chat session ──
  useEffect(() => {
    const handleDiscussEvent = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      setLeftView("chat");
      if (detail.book) {
        onSelectBook(detail.book);
      }
      if (detail.query) {
        const targetBookId = detail.book?.id || book?.id || 1;
        setMessages((prev) => [...prev, { from: "user", text: detail.query }]);
        executeRagChat(detail.query, targetBookId);
      }
    };

    window.addEventListener("aarva_discuss_in_upload", handleDiscussEvent);
    return () => {
      window.removeEventListener("aarva_discuss_in_upload", handleDiscussEvent);
    };
  }, [book?.id]);

  // ── End-to-end Document Ingestion & RAG Ingestion with 0-100% Progress ──
  const doUpload = async (file: File, initialQuery?: string) => {
    setUploadError("");
    setUploading(true);
    setUploadingFile(file);
    setUploadProgress(0);
    const user = (() => { try { return JSON.parse(localStorage.getItem("aarva_user") || "null"); } catch { return null; } })();
    const userId = user?.id || 6;

    const form = new FormData();
    form.append("user_id", String(userId));
    form.append("title", file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    form.append("author", user?.name || "Uploaded by student");
    form.append("file", file);

    try {
      const data = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        uploadXhrRef.current = xhr;
        const token = localStorage.getItem("aarva_token") ?? "";

        // Track file upload network transmission (0% - 40%)
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.max(5, Math.min(40, Math.round((event.loaded / event.total) * 40)));
            setUploadProgress(pct);
          }
        };

        // Server-side parsing, chunking, vector indexing (45% -> 95%)
        xhr.upload.onload = () => {
          setUploadProgress(45);
          let current = 45;
          stageTimerRef.current = setInterval(() => {
            if (current < 92) {
              current += Math.floor(Math.random() * 5) + 3;
              if (current > 95) current = 95;
              setUploadProgress(current);
            }
          }, 220);
        };

        xhr.onload = () => {
          if (stageTimerRef.current) {
            clearInterval(stageTimerRef.current);
            stageTimerRef.current = null;
          }
          uploadXhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid response format from server."));
            }
          } else {
            try {
              const errJson = JSON.parse(xhr.responseText);
              reject(new Error(errJson.detail || `Upload failed (${xhr.status}).`));
            } catch {
              reject(new Error(`Upload failed with status code ${xhr.status}.`));
            }
          }
        };

        xhr.onerror = () => {
          if (stageTimerRef.current) {
            clearInterval(stageTimerRef.current);
            stageTimerRef.current = null;
          }
          uploadXhrRef.current = null;
          reject(new Error("Network connection lost during file transmission."));
        };

        xhr.onabort = () => {
          if (stageTimerRef.current) {
            clearInterval(stageTimerRef.current);
            stageTimerRef.current = null;
          }
          uploadXhrRef.current = null;
          reject(new Error("ABORTED_BY_USER"));
        };

        xhr.open("POST", `${API}/api/textbooks/upload`);
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(form);
      });

      // Jump to 100% when backend completes processing
      setUploadProgress(100);
      await new Promise((r) => setTimeout(r, 400));

      onUploaded(); // refresh library

      const newBook: LearningBook = {
        ...data.textbook,
        color: COVER_COLORS[books.length % COVER_COLORS.length],
        concepts: ["Core Concepts", "Architecture", "Protocols", "Key Rules"],
      };
      onSelectBook(newBook);

      if (data.textbook?.summary) {
        setSummaryData(data.textbook.summary);
      }

      setMessages((c) => [
        ...c,
        {
          from: "ai",
          text: `Hi! I've finished reading **${newBook.title}**. The summary and study guides are ready on the right. What would you like to explore first?`,
        },
      ]);

      setUploading(false);
      setUploadingFile(null);

      if (initialQuery && initialQuery.trim()) {
        await executeRagChat(initialQuery.trim(), newBook.id, userId);
      } else {
        setActiveTab("Summary");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "ABORTED_BY_USER") {
        // User deliberately cancelled upload and removed the file
        return;
      }
      const errMsg = err instanceof Error ? err.message : "Upload failed.";
      setUploadError(errMsg);
      setMessages((c) => [
        ...c,
        { from: "ai", text: `⚠️ Upload error: ${errMsg}. Please try again.` },
      ]);
      setUploading(false);
      setUploadingFile(null);
    } finally {
      setTimeout(() => setUploadProgress(0), 1200);
    }
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim() && attachedFiles.length === 0) return;
    if (isSending || uploading) return;

    const queryText = message.trim();
    const hasFiles = attachedFiles.length > 0;
    const fileToUpload = hasFiles ? attachedFiles[0] : null;

    setMessage("");
    setAttachedFiles([]);
    setChatPreviewFile(null);
    setChatPreviewUrl(null);

    if (fileToUpload) {
      setMessages((c) => [
        ...c,
        {
          from: "user",
          text: queryText ? `📎 [${fileToUpload.name}] ${queryText}` : `📎 Attached: ${fileToUpload.name}`,
        },
        {
          from: "ai",
          text: `Ingesting "${fileToUpload.name}" and preparing your study guide...`,
        },
      ]);
      await doUpload(fileToUpload, queryText);
      return;
    }

    if (queryText) {
      setMessages((c) => [...c, { from: "user", text: queryText }]);

      let activeBookId = book?.id;
      if (!activeBookId) {
        if (books.length > 0) {
          activeBookId = books[0].id;
          onSelectBook(books[0]);
        } else {
          activeBookId = 1;
        }
      }

      await executeRagChat(queryText, activeBookId);
    }
  };

  const handleChipClick = (promptText: string) => {
    setMessage(promptText);
    setLeftView("chat");
  };

  const handleRetryLast = async () => {
    const lastUserMsg = [...messages].reverse().find(m => m.from === "user");
    if (lastUserMsg) {
      const cleanText = lastUserMsg.text.replace(/^📎\s*\[[^\]]+\]\s*/, "");
      if (cleanText) {
        let activeBookId = book?.id || (books.length > 0 ? books[0].id : 1);
        await executeRagChat(cleanText, activeBookId);
      }
    }
  };

  const handleClearChat = () => {
    const title = summaryData?.title || book?.title || "your uploaded document";
    setMessages([
      {
        from: "ai",
        text: `Chat cleared. I'm ready to answer any questions about "${title}". What would you like to know?`
      }
    ]);
  };

  // ── Dynamic Study Data Extraction ─────────────────────────────────────────
  const docDisplayTitle = summaryData?.title || (book?.title ? book.title.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") : "New Workspace");
  const overviewText = summaryData?.overview || summaryData?.summary || (summaryData as any)?.complete_summary || "Upload a document to generate an AI-powered study guide and interactive summary.";
  const takeawayText = summaryData?.main_takeaway || "Ready to analyze a new document.";

  const keyPointsList = (summaryData?.key_points && summaryData.key_points.length > 0)
    ? summaryData.key_points
    : [
      "Upload a textbook, PDF, or document to extract key takeaways.",
      "Use the chat on the left to ask questions about your uploaded content.",
      "Automatically generated quizzes and concepts will appear here."
    ];

  const topicsCoveredList = (summaryData?.topics_covered && summaryData.topics_covered.length > 0)
    ? summaryData.topics_covered
    : ["No topics extracted yet"];

  const chapterList: Array<{ chapter?: number; page?: number; title?: string; summary?: string }> = (summaryData?.chapters && summaryData.chapters.length > 0)
    ? summaryData.chapters
    : [
      { chapter: 1, page: 1, title: "Waiting for Document", summary: "Upload a document to extract chapters and structural sections." }
    ];

  const conceptList: Array<{ name: string; explanation: string; how_it_works?: string; example?: string }> = (summaryData?.concepts && summaryData.concepts.length > 0)
    ? summaryData.concepts.map((c: any, idx: number) => {
      if (typeof c === "string") {
        return {
          name: c,
          explanation: `Important conceptual building block covered in ${docDisplayTitle}.`,
          how_it_works: `Coordinates the structural inputs and outputs for this domain.`,
          example: `Like a modular building block that connects separate functional units.`
        };
      }
      return {
        name: c.name || `Concept #${idx + 1}`,
        explanation: c.explanation || "Core concept explanation.",
        how_it_works: c.how_it_works || "Operational mechanics and processing logic.",
        example: c.example || "Real-world analogy to illustrate the concept."
      };
    })
    : [
      {
        name: "System Architecture",
        explanation: "The high-level structural blueprint and modular component layout.",
        how_it_works: "Coordinates communication between frontend interfaces, backend endpoints, and vector stores.",
        example: "Like the master blueprints of a modern building ensuring electrical, plumbing, and safety work together."
      },
      {
        name: "Hybrid Retrieval Engine",
        explanation: "A dual-channel search combining dense semantic vectors with BM25 lexical keyword matching.",
        how_it_works: "Balances conceptual meaning with exact keyword matches to retrieve the most precise document excerpt.",
        example: "Like having both a research librarian and a word-indexed dictionary working simultaneously."
      },
      {
        name: "Verification & Test Harness",
        explanation: "Automated test suites validating data accuracy and system reliability.",
        how_it_works: "Simulates edge cases, load patterns, and malformed inputs to ensure resilience.",
        example: "Like crash-testing a car prototype before starting full factory production."
      }
    ];

  const definitionList: Array<{ term: string; definition: string }> = (summaryData?.definitions && summaryData.definitions.length > 0)
    ? summaryData.definitions.map((d: any) => ({
      term: d.term || d[0] || "Term",
      definition: d.definition || d[1] || "Definition from document."
    }))
    : [
      { term: "Knowledge Transfer (KT)", definition: "The structured process of transferring project context, architectural decisions, and operational details between team members." },
      { term: "Document Intelligence", definition: "Automated extraction of structured tables, entities, and semantic relationships from complex documents." },
      { term: "RAG (Retrieval-Augmented Generation)", definition: "A pattern where relevant excerpts from private documents are retrieved and provided to an LLM for factual, hallucination-free answers." }
    ];

  const notesList: Array<{ note: string; type?: string; page?: number }> = (summaryData?.important_notes && summaryData.important_notes.length > 0)
    ? summaryData.important_notes.map((n: any) => {
      if (typeof n === "string") return { note: n, type: "Important", page: 1 };
      return { note: n.note || n.text || String(n), type: n.type || "Requirement", page: n.page || 1 };
    })
    : [
      { note: "System architecture is designed for modular scalability and local Ollama inference.", type: "Requirement", page: 1 },
      { note: "Frontend and backend communication is governed by RESTful JSON schemas.", type: "Technical Fact", page: 2 },
      { note: "Verify that all edge cases in file parsing are supported before production release.", type: "Exam Focus", page: 3 }
    ];

  const filteredDefinitions = defSearchQuery.trim()
    ? definitionList.filter(d => d.term.toLowerCase().includes(defSearchQuery.toLowerCase()) || d.definition.toLowerCase().includes(defSearchQuery.toLowerCase()))
    : definitionList;

  // ── Book selected — show analysis workspace ───────────────────────────────
  return (
    <section className={`analysis-workspace ${zenMode ? "fullscreen-zen" : ""}`}>
      {uploadError && <p className="form-error" style={{ padding: "0.4rem 1.5rem" }}>{uploadError}</p>}

      {/* Main Split Body: Left 50% & Right 50% */}
      <div className="analysis-split-body">
        {/* ── LEFT PANE: AI Tutor Chat / Document Viewer ─────────────────── */}
        <section className="analysis-left-pane">
          {/* Top Pill Switcher: Chat / Files & New Chat */}
          <div className="pane-pill-row">
            <div className="left-pill-toggle">
              <button
                type="button"
                className={leftView === "chat" ? "active" : ""}
                onClick={() => setLeftView("chat")}
              >
                Chat
              </button>
              <button
                type="button"
                className={leftView === "files" ? "active" : ""}
                onClick={() => setLeftView("files")}
              >
                Files
                {(book?.id || selectedFile || chatPreviewFile) && (
                  <span className="pill-badge">1</span>
                )}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                type="button"
                className="new-chat-pill-btn"
                onClick={handleNewChat}
                title="Start a new chat session"
                aria-label="New chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New</span>
              </button>
            </div>
          </div>

          {/* View Mode: Files / Document Viewer */}
          {leftView === "files" && (
            <div className="doc-viewer-wrapper" style={{ height: "calc(100% - 3.4rem)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {uploading && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.3rem 0.8rem",
                  background: "#fff1f2",
                  borderBottom: "1px solid #fecdd3",
                  color: "#9f1239",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  flexShrink: 0
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0, overflow: "hidden" }}>
                    <span style={{ fontSize: "0.85rem" }}>⏳</span>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      Uploading <b>{uploadingFile?.name || "document"}</b> ({uploadProgress}%)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    style={{
                      background: "#ffffff",
                      color: "#e11d48",
                      border: "1px solid #fda4af",
                      borderRadius: "999px",
                      padding: "0.15rem 0.55rem",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      flexShrink: 0
                    }}
                    title="Cancel upload and remove file"
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
              {chatPreviewFile && chatPreviewUrl ? (
                <FilePreviewPane
                  src={chatPreviewUrl}
                  fileName={chatPreviewFile.name}
                  fileType={chatPreviewFile.type}
                  pageNumber={currentPage}
                  onPageChange={setCurrentPage}
                />
              ) : selectedFile && filePreviewUrl ? (
                <FilePreviewPane
                  src={filePreviewUrl}
                  fileName={selectedFile.name}
                  fileType={selectedFile.type}
                  pageNumber={currentPage}
                  onPageChange={setCurrentPage}
                />
              ) : book?.id ? (
                <FilePreviewPane
                  src={`${API}/api/textbooks/${book.id}/file`}
                  fileName={book.file_name || `${book.title}.pdf`}
                  fileType={(book as any)?.file_type || ""}
                  pageNumber={currentPage}
                  onPageChange={setCurrentPage}
                />
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.85rem", padding: "1.25rem 1rem", textAlign: "center" }}>
                  <div style={{ width: "2.6rem", height: "2.6rem", borderRadius: "0.85rem", background: "linear-gradient(135deg, rgba(116,88,245,0.12), rgba(0,153,255,0.1))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", boxShadow: "0 2px 10px rgba(116,88,245,0.12)" }}>
                    📂
                  </div>
                  <div style={{ maxWidth: "260px" }}>
                    <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--ink)", fontWeight: 700, fontSize: "0.92rem" }}>No file uploaded yet</h4>
                    <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.76rem", color: "var(--ink-soft)", lineHeight: 1.5 }}>
                      Upload a PDF, Word, or Excel file using <b>+</b> in chat or browse below.
                    </p>
                    <button
                      type="button"
                      onClick={() => chatFileInputRef.current?.click()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.32rem 0.85rem",
                        fontSize: "0.76rem",
                        fontWeight: 600,
                        color: "#7458f5",
                        background: "#f4f0ff",
                        border: "1px solid #ddd3fb",
                        borderRadius: "999px",
                        cursor: "pointer",
                        transition: "all 0.18s ease"
                      }}
                    >
                      <span>+</span>
                      <span>Browse Document</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* View Mode: Chat */}
          {leftView === "chat" && (
            <div className="doc-chat-wrapper">
              <div className="chat-messages">
                {messages.length === 0 && !uploading ? (
                  <div className="chat-empty-state">
                    <div className="chat-empty-icon"><Icon name="spark" size={32} /></div>
                    <h3>Ask Your AI Tutor</h3>
                    <p>Ask direct questions, clarify tricky concepts, explore analogies, or request study summaries grounded in your uploaded text.</p>
                  </div>
                ) : (
                  messages.map((item, index) => (
                    <div className={`chat-bubble ${item.from}`} key={`${item.text}-${index}`}>
                      {item.from === "ai" && <span><Icon name="spark" size={13} /></span>}
                      <div className="chat-bubble-content">
                        {renderMarkdown(item.text)}
                        {item.sources && item.sources.length > 0 && (
                          <div style={{ marginTop: "0.6rem", display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
                            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>Cited Pages:</span>
                            {item.sources.map((src: any, sIdx: number) => {
                              const pg = src.page || 1;
                              const label = src.chapter && !src.chapter.startsWith("Page ")
                                ? `Pg ${pg} · ${src.chapter}`
                                : `Pg ${pg}`;
                              return (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => {
                                    setCurrentPage(pg);
                                    setLeftView("files");
                                  }}
                                  title={src.snippet || `Navigate to Page ${pg}`}
                                  style={{
                                    background: "#ede9fe",
                                    color: "#5b21b6",
                                    border: "1px solid #ddd6fe",
                                    borderRadius: "6px",
                                    padding: "2px 7px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    transition: "all 0.15s ease"
                                  }}
                                >
                                  <span>📄</span>
                                  <span>{label}</span>
                                  <span style={{ opacity: 0.6 }}>→</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* ── Typing Indicator ── */}
                {isSending && (
                  <div className="chat-bubble ai" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span><Icon name="spark" size={13} /></span>
                    <div style={{ display: "flex", gap: "4px", padding: "4px 8px" }}>
                      <span className="typing-dot" style={{ width: "6px", height: "6px", background: "#7458f5", borderRadius: "50%", animation: "pulse 1s infinite alternate" }} />
                      <span className="typing-dot" style={{ width: "6px", height: "6px", background: "#7458f5", borderRadius: "50%", animation: "pulse 1s infinite alternate 0.2s" }} />
                      <span className="typing-dot" style={{ width: "6px", height: "6px", background: "#7458f5", borderRadius: "50%", animation: "pulse 1s infinite alternate 0.4s" }} />
                    </div>
                  </div>
                )}

                {/* ── Upload Progress Card in Chat ── */}
                {uploading && (
                  <div className="chat-upload-progress-card">
                    <div className="cup-header">
                      <div className="cup-icon-ring">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="16 16 12 12 8 16" />
                          <line x1="12" y1="12" x2="12" y2="21" />
                          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                        </svg>
                      </div>
                      <div className="cup-title-block">
                        <span className="cup-title">
                          {uploadingFile ? `Ingesting "${uploadingFile.name}"` : "Ingesting Document"}
                        </span>
                        <span className="cup-subtitle">
                          {uploadProgress < 40
                            ? "Reading document stream..."
                            : uploadProgress < 65
                              ? "Extracting text and structure..."
                              : uploadProgress < 85
                                ? "Generating semantic representations..."
                                : uploadProgress < 100
                                  ? "Building structured study guide..."
                                  : "Finalising knowledge graph..."}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                        <span className="cup-pct">{uploadProgress}%</span>
                        <button
                          type="button"
                          className="cup-cancel-btn"
                          onClick={handleCancelUpload}
                          title="Cancel upload and remove file"
                          aria-label="Remove uploading file"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>

                    <div className="cup-bar-track">
                      <div className="cup-bar-fill" style={{ width: `${uploadProgress}%` }} />
                      <div className="cup-bar-glow" style={{ left: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Attachments Row */}
              {attachedFiles.length > 0 && (
                <div className="chat-attachments-row">
                  {attachedFiles.map((f, idx) => (
                    <span className="chat-attachment-chip" key={idx}>
                      <span className="attachment-name">{f.name}</span>
                      <button
                        type="button"
                        className="attachment-remove-btn"
                        onClick={() => removeAttachedFile(idx)}
                        aria-label="Remove attachment"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Prompt Suggestion Chips */}
              <div style={{ display: "flex", gap: "0.3rem", padding: "0.25rem 0.75rem", overflowX: "auto", background: "#ffffff", borderTop: "1px solid #f1f5f9" }}>
                {[
                  t("explainSimply", "Explain this simply"),
                  t("mainIdea", "What is the main idea?"),
                  t("giveExample", "Give me an example"),
                  t("summarizeSection", "Summarize this section")
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    style={{
                      padding: "0.18rem 0.55rem",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#6366f1",
                      background: "#f5f3ff",
                      border: "1px solid #ede9fe",
                      borderRadius: "999px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease"
                    }}
                  >
                    ✨ {chip}
                  </button>
                ))}
              </div>

              {/* Modern Chat Bar */}
              <form className="chat-input-modern" onSubmit={sendMessage}>
                {/* File Attachment Button */}
                <input
                  type="file"
                  ref={chatFileInputRef}
                  style={{ display: "none" }}
                  onChange={handleChatFileSelect}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.md"
                />
                <button
                  type="button"
                  className="chat-action-btn attach-btn"
                  onClick={() => {
                    if (book?.id || attachedFiles.length > 0 || uploadingFile || chatPreviewFile) {
                      alert("Only one file per chat session can be uploaded. Click \"+ New\" at the top to start a fresh chat session for a new document.");
                      return;
                    }
                    chatFileInputRef.current?.click();
                  }}
                  title={book?.id || attachedFiles.length > 0 ? "Only 1 file allowed per chat session (click + New for a new document)" : "Attach document (single file)"}
                  aria-label="Attach document"
                  style={{
                    opacity: (book?.id || attachedFiles.length > 0 || uploadingFile) ? 0.45 : 1,
                    cursor: (book?.id || attachedFiles.length > 0 || uploadingFile) ? "not-allowed" : "pointer"
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>

                {/* Text input */}
                <input
                  type="text"
                  className="chat-text-input"
                  placeholder={book ? "Ask anything about this document..." : attachedFiles.length > 0 ? "Add a message or press send to upload..." : "Ask your AI tutor or attach a file to get started..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                {/* Right Controls */}
                <div className="chat-right-controls">
                  {/* Mic Button */}
                  <button
                    type="button"
                    className={`chat-action-btn mic-btn ${isListening ? "listening" : ""}`}
                    onClick={toggleSpeechRecognition}
                    title={isListening ? "Listening... (Click to stop)" : "Speak your question"}
                    aria-label="Voice input"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="22" />
                    </svg>
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    className={`chat-send-submit-btn ${isSending ? "sending" : ""}`}
                    aria-label="Send message"
                    title="Send message"
                    disabled={(!message.trim() && attachedFiles.length === 0) || isSending}
                  >
                    {isSending ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                        </path>
                      </svg>
                    ) : (
                      <Icon name="send-up" size={16} />
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* ── RIGHT PANE: Study Tabs, Overview, Chapters, Concepts, Definitions ── */}
        <section className="analysis-right-pane" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#ffffff" }}>
          {/* Main Top Tab Row with dynamic counts — only shown when a book is loaded */}
          <div className="right-main-tab-bar" style={{ display: (book || summaryData) ? "flex" : "none", alignItems: "center", borderBottom: "1px solid #eef0f3", padding: "0 1.25rem", background: "#ffffff", gap: "1.25rem", flexShrink: 0, overflowX: "auto" }}>
            {[
              { id: "Summary", label: t("summary") },
              { id: "Chapters", label: t("chapters"), count: chapterList.length },
              { id: "Concepts", label: t("concepts"), count: conceptList.length },
              { id: "Definitions", label: t("definitions"), count: definitionList.length },
              { id: "Important Notes", label: t("importantNotes"), count: notesList.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`main-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                style={{
                  padding: "0.85rem 0.15rem",
                  background: "transparent",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "2.5px solid #6366f1" : "2.5px solid transparent",
                  color: activeTab === tab.id ? "#1e1b4b" : "#64748b",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  whiteSpace: "nowrap"
                }}
                onClick={() => { setActiveTab(tab.id as any); setSubFilter("All"); }}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{ fontSize: "0.72rem", color: activeTab === tab.id ? "#6366f1" : "#94a3b8", background: activeTab === tab.id ? "#ede9fe" : "#f1f5f9", padding: "1px 6px", borderRadius: "10px", fontWeight: 700 }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── EMPTY STATE: fills full pane height when no book is loaded ── */}
          {!book && !summaryData && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.85rem", textAlign: "center", padding: "1.5rem" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2 C12 2 12.8 7.2 14.5 9.5 C16.8 11.2 22 12 22 12 C22 12 16.8 12.8 14.5 14.5 C12.8 16.8 12 22 12 22 C12 22 11.2 16.8 9.5 14.5 C7.2 12.8 2 12 2 12 C2 12 7.2 11.2 9.5 9.5 C11.2 7.2 12 2 12 2Z" fill="#6366f1"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: "0 0 0.35rem", fontSize: "1rem", fontWeight: 700, color: "#1e293b", letterSpacing: "-0.01em" }}>Analysis coming soon</h3>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b", lineHeight: 1.5, maxWidth: "260px" }}>
                  AI-generated summaries, chapter breakdowns, key concepts, and revision notes will appear here once processed.
                </p>
              </div>
            </div>
          )}

          {/* Scrollable Content Area — only when book is loaded */}
          {(book || summaryData) && (
          <div className="analysis-cards-scroll" style={{ padding: "1.4rem 1.6rem", flex: 1, overflowY: "auto" }}>

            {/* ── 1. SUMMARY TAB ── */}
            {(book || summaryData) && activeTab === "Summary" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem", maxWidth: "800px" }}>
                {/* AI Summary Banner with Language Switcher */}
                <div style={{ background: "#f5f3ff", borderRadius: "0.8rem", padding: "1.25rem 1.4rem", border: "1px solid #ede9fe" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#6366f1", fontSize: "0.85rem", fontWeight: 700 }}>
                      <span>✦</span> AI-generated summary · Based on the uploaded textbook
                    </div>

                    {/* Language Preference Toggle: Interface Language vs Original Textbook */}
                    {languageObj.code !== "en" && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "#ede9fe", padding: "2px 4px", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.72rem", color: "#5b21b6", fontWeight: 700, paddingLeft: "4px" }}>
                          Language:
                        </span>
                        <button
                          type="button"
                          onClick={() => setSummaryLangMode("interface")}
                          style={{
                            border: "none",
                            background: summaryLangMode === "interface" ? "#6366f1" : "transparent",
                            color: summaryLangMode === "interface" ? "#ffffff" : "#4338ca",
                            borderRadius: "6px",
                            padding: "3px 8px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px"
                          }}
                          title={`Display summary translated to your selected interface language (${languageObj.nativeName})`}
                        >
                          <span>🇮🇳</span> {languageObj.nativeName}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSummaryLangMode("textbook")}
                          style={{
                            border: "none",
                            background: summaryLangMode === "textbook" ? "#6366f1" : "transparent",
                            color: summaryLangMode === "textbook" ? "#ffffff" : "#4338ca",
                            borderRadius: "6px",
                            padding: "3px 8px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px"
                          }}
                          title="Display summary in the original textbook language (English)"
                        >
                          <span>🌐</span> Original (English)
                        </button>
                      </div>
                    )}
                  </div>
                  {summaryLoading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6366f1", fontSize: "0.85rem", padding: "0.5rem 0" }}>
                      <span className="typing-dot" style={{ width: "6px", height: "6px", background: "#6366f1", borderRadius: "50%", animation: "pulse 1s infinite alternate" }} />
                      <span>Generating summary in {summaryLangMode === "interface" ? languageObj.nativeName : "English"}...</span>
                    </div>
                  ) : (
                    <p style={{ margin: 0, color: "#475569", fontSize: "0.92rem", lineHeight: 1.65 }}>
                      {overviewText}
                    </p>
                  )}
                </div>

                {/* In One Sentence Highlight Box */}
                <div style={{ background: "#ffffff", border: "1px solid #6366f1", borderRadius: "0.8rem", padding: "1.25rem 1.4rem", boxShadow: "0 4px 14px rgba(99, 102, 241, 0.08)" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#6366f1", fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.8rem" }}>
                    <span>💡</span> In one sentence
                  </div>
                  <p style={{ margin: 0, color: "#1e293b", fontSize: "1.05rem", lineHeight: 1.5, fontWeight: 600 }}>
                    "{docDisplayTitle}"
                  </p>
                </div>

                {/* Key Takeaways */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "1rem", padding: "1.25rem 1.4rem", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
                    <span style={{ color: "#ef4444", fontSize: "1rem" }}>📌</span>
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1e293b" }}>
                      Key takeaways
                    </h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {keyPointsList.map((pt, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", background: "#f8fafc", padding: "0.8rem 1rem", borderRadius: "0.6rem", border: "1px solid #f1f5f9" }}>
                        <span style={{ color: "#6366f1", fontWeight: 800, fontSize: "1.1rem", lineHeight: 1 }}>•</span>
                        <span style={{ color: "#334155", fontSize: "0.9rem", lineHeight: 1.55 }}>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topics Covered */}
                <div>
                  <h3 style={{ margin: "0 0 0.65rem", fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Topics covered
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {topicsCoveredList.map((topic: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleChipClick(`Explain the "${topic}" section in detail`)}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.6rem",
                          padding: "0.5rem 0.9rem",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#334155",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <span>📘</span>
                        <span>{topic}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. CHAPTERS / SECTIONS TAB ── */}
            {activeTab === "Chapters" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "800px" }}>
                <div style={{ marginBottom: "0.4rem" }}>
                  <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                    Document Sections &amp; Chapters
                  </h3>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                    Actual structural topics detected from the uploaded document
                  </p>
                </div>

                {chapterList.map((ch, idx) => (
                  <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.9rem", padding: "1.2rem", boxShadow: "0 1px 4px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "#6366f1", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", background: "#ede9fe", padding: "2px 8px", borderRadius: "6px" }}>
                          {ch.chapter ? `Section ${ch.chapter}` : `Topic #${idx + 1}`}
                        </span>
                        <h4 style={{ margin: "0.4rem 0 0", fontSize: "1rem", fontWeight: 700, color: "#1e293b" }}>
                          {ch.title || `Section ${idx + 1}`}
                        </h4>
                      </div>
                      {ch.page && (
                        <button
                          type="button"
                          onClick={() => { setCurrentPage(ch.page || 1); setLeftView("files"); }}
                          style={{ color: "#6366f1", background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: "6px", padding: "3px 8px", cursor: "pointer", fontSize: "0.76rem", fontWeight: 700 }}
                        >
                          pg {ch.page} →
                        </button>
                      )}
                    </div>
                    <p style={{ margin: "0 0 0.85rem", color: "#475569", fontSize: "0.88rem", lineHeight: 1.6 }}>
                      {ch.summary || "Summary of this section based on extracted content."}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleChipClick(`Explain ${ch.title || "this section"} in simpler terms`)}
                      style={{ color: "#4f46e5", background: "transparent", border: "none", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700, padding: 0, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    >
                      <span>💬</span> Ask AI about this section
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── 3. CONCEPTS TAB ── */}
            {activeTab === "Concepts" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "800px" }}>
                <div style={{ marginBottom: "0.4rem" }}>
                  <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                    Core Concepts Explained
                  </h3>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                    Essential ideas simplified with clear mechanics and intuitive analogies
                  </p>
                </div>

                {conceptList.map((c, idx) => (
                  <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.9rem", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                      <span style={{ fontSize: "1.1rem" }}>✨</span>
                      <h4 style={{ margin: 0, fontSize: "1.02rem", fontWeight: 800, color: "#1e293b" }}>
                        {c.name}
                      </h4>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.88rem" }}>
                      {/* Simple Explanation */}
                      <div>
                        <span style={{ color: "#475569", fontWeight: 700 }}>• Simple Explanation: </span>
                        <span style={{ color: "#1e293b", lineHeight: 1.55 }}>{c.explanation}</span>
                      </div>

                      {/* How it works */}
                      {c.how_it_works && (
                        <div>
                          <span style={{ color: "#475569", fontWeight: 700 }}>• How it works: </span>
                          <span style={{ color: "#334155", lineHeight: 1.55 }}>{c.how_it_works}</span>
                        </div>
                      )}

                      {/* Example / Analogy */}
                      {c.example && (
                        <div style={{ background: "#f8fafc", borderLeft: "3px solid #6366f1", borderRadius: "0 0.5rem 0.5rem 0", padding: "0.6rem 0.8rem", marginTop: "0.2rem" }}>
                          <span style={{ color: "#4338ca", fontWeight: 700 }}>Analogy: </span>
                          <span style={{ color: "#334155", fontStyle: "italic" }}>{c.example}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: "0.85rem" }}>
                      <button
                        type="button"
                        onClick={() => handleChipClick(`Give me a detailed practical example of "${c.name}"`)}
                        style={{ color: "#4f46e5", background: "transparent", border: "none", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700, padding: 0, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                      >
                        <span>💡</span> Ask AI for more examples
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── 4. DEFINITIONS TAB ── */}
            {activeTab === "Definitions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "800px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                      Glossary &amp; Definitions
                    </h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                      Key terms and definitions directly extracted from the document
                    </p>
                  </div>

                  {/* Search bar for definitions */}
                  <input
                    type="text"
                    placeholder="Search terms..."
                    value={defSearchQuery}
                    onChange={(e) => setDefSearchQuery(e.target.value)}
                    style={{
                      padding: "0.45rem 0.8rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.84rem",
                      outline: "none",
                      width: "200px"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "0.9rem" }}>
                  {filteredDefinitions.map((def, idx) => (
                    <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.8rem", padding: "1.1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                      <div style={{ fontSize: "0.96rem", fontWeight: 800, color: "#1e293b", marginBottom: "0.4rem" }}>
                        {def.term}
                      </div>
                      <p style={{ margin: 0, color: "#475569", fontSize: "0.86rem", lineHeight: 1.55 }}>
                        {def.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 5. IMPORTANT NOTES TAB ── */}
            {activeTab === "Important Notes" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "800px" }}>
                <div style={{ marginBottom: "0.4rem" }}>
                  <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                    Important Notes &amp; Requirements
                  </h3>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                    Critical dates, technical specifications, and key requirements
                  </p>
                </div>

                {notesList.map((item, idx) => (
                  <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.8rem", padding: "1.1rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "0.9rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                    <span style={{
                      fontSize: "0.74rem",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      background: item.type === "Exam Focus" ? "#fef3c7" : item.type === "Requirement" ? "#ede9fe" : "#f1f5f9",
                      color: item.type === "Exam Focus" ? "#b45309" : item.type === "Requirement" ? "#5b21b6" : "#475569",
                      border: item.type === "Exam Focus" ? "1px solid #fde68a" : item.type === "Requirement" ? "1px solid #ddd6fe" : "1px solid #e2e8f0"
                    }}>
                      {item.type || "Note"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, color: "#1e293b", fontSize: "0.88rem", lineHeight: 1.6 }}>
                        {item.note}
                      </p>
                    </div>
                    {item.page && (
                      <button
                        type="button"
                        onClick={() => { setCurrentPage(item.page || 1); setLeftView("files"); }}
                        style={{ color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontSize: "0.76rem", fontWeight: 700, whiteSpace: "nowrap" }}
                      >
                        (pg {item.page}) →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
          )}
        </section>
      </div>
    </section>
  );
}

function LibraryView({
  books,
  started,
  openBook,
  startTest,
  onUploadClick,
  onUploaded,
}: {
  books: LearningBook[];
  started: Set<number>;
  openBook: (book: LearningBook) => void;
  startTest: (book: LearningBook) => void;
  onUploadClick: () => void;
  onUploaded: () => void;
}) {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED" | "UNREAD">("ALL");
  const [sortBy, setSortBy] = useState<"RECENT" | "TITLE_ASC" | "TITLE_DESC" | "PROGRESS_DESC">("RECENT");

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this book from your library?")) return;
    setDeleting(id);
    try { await apiFetch(`/api/textbooks/${id}`, { method: "DELETE" }); onUploaded(); } catch {/* ignore */ }
    setDeleting(null);
  };

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.subject && b.subject.trim()) set.add(b.subject.trim());
    });
    return Array.from(set);
  }, [books]);

  const filteredAndSortedBooks = useMemo(() => {
    return books
      .filter((b) => {
        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchAuthor = b.author && b.author.toLowerCase().includes(q);
          const matchSubject = b.subject && b.subject.toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchSubject) return false;
        }

        if (selectedSubject !== "ALL" && (b.subject || "Textbook") !== selectedSubject) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "TITLE_ASC") return a.title.localeCompare(b.title);
        if (sortBy === "TITLE_DESC") return b.title.localeCompare(a.title);
        return b.id - a.id;
      });
  }, [books, searchQuery, selectedSubject, sortBy]);

  const hasActiveFilters = searchQuery !== "" || selectedSubject !== "ALL" || sortBy !== "RECENT";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSubject("ALL");
    setSortBy("RECENT");
  };

  return (
    <section className="library-view">
      <div className="page-intro">
        <div>
          <p className="kicker">Knowledge Repository</p>
          <h2>Smart Study Library</h2>
          <p>Browse your textbooks, explore AI chapter notes, and quiz yourself — all in one place.</p>
        </div>
        <div className="page-actions">
          <button className="upload-new" type="button" onClick={onUploadClick}>
            + Upload Document
          </button>
        </div>
      </div>

      {books.length > 0 && (
        <div className="library-filter-bar">
          <div className="library-search-box filter-search">
            <span className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by title, author, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-right-controls">
            <label className="filter-sort-label">
              <span>Sort:</span>
              <select
                className="filter-select sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort documents"
              >
                <option value="RECENT">Recently Added</option>
                <option value="TITLE_ASC">Title (A → Z)</option>
                <option value="TITLE_DESC">Title (Z → A)</option>
              </select>
            </label>

            <div className="filter-view-toggle">
              <span className="filter-view-label">View:</span>
              <div className="view-toggle-buttons" role="group" aria-label="View layout switcher">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" />
                    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" />
                    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" />
                    <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  title="List view"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="2.5" width="2.5" height="2.5" rx="0.6" />
                    <rect x="6.5" y="2.5" width="7.5" height="2.5" rx="0.6" />
                    <rect x="2" y="6.75" width="2.5" height="2.5" rx="0.6" />
                    <rect x="6.5" y="6.75" width="7.5" height="2.5" rx="0.6" />
                    <rect x="2" y="11" width="2.5" height="2.5" rx="0.6" />
                    <rect x="6.5" y="11" width="7.5" height="2.5" rx="0.6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {books.length === 0 ? (
        <div className="library-empty">
          <h3>Your Library is Empty</h3>
          <p>Upload a textbook, syllabus, or lecture notes (PDF, DOCX, TXT) to extract key concepts, summaries, and adaptive quizzes with Aarva AI.</p>
          <button className="auth-primary" type="button" onClick={onUploadClick} style={{ maxWidth: "20rem", margin: "0 auto" }}>
            Upload your first document <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle" }}><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
          </button>
        </div>
      ) : filteredAndSortedBooks.length === 0 ? (
        <div className="library-empty">
          <div className="library-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7458f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <h3>No documents matched your search</h3>
          <p>Try adjusting your search keywords or selected subject filter.</p>
          <button className="auth-primary" type="button" onClick={clearAllFilters} style={{ maxWidth: "12rem", margin: "0 auto" }}>
            Reset filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="library-grid">
          {filteredAndSortedBooks.map((book, i) => {
            const color = book.color || COVER_COLORS[i % COVER_COLORS.length];
            const pages = book.total_pages ?? book.pages ?? 0;
            return (
              <article className="library-card" key={book.id}>
                <button className={`book-cover ${color}`} type="button" onClick={() => openBook(book)}>
                  <span className="cover-mark"><Icon name="spark" size={15} /></span>
                  <b>{book.title}</b>
                </button>
                <div className="book-details">
                  <div className="book-meta-top">
                    <small>{pages > 0 ? `${pages} pages` : book.file_name ?? "PDF Document"}</small>
                    {started.has(book.id) && <span className="test-started">Quiz active</span>}
                    {book.status === "processing" && <span className="test-started" style={{ background: "#f5a623" }}>Processing…</span>}
                  </div>
                  <h3>{book.title}</h3>
                  <div className="book-actions">
                    <button type="button" onClick={() => openBook(book)}>Study</button>
                    <button type="button" className="btn-take-test" onClick={() => startTest(book)}>Quiz</button>
                    <button type="button" className="book-delete" onClick={() => handleDelete(book.id)} disabled={deleting === book.id} aria-label="Delete book" title="Delete book">✕</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="library-list">
          {filteredAndSortedBooks.map((book, i) => {
            const color = book.color || COVER_COLORS[i % COVER_COLORS.length];
            const pages = book.total_pages ?? book.pages ?? 0;
            return (
              <article className="library-list-row" key={book.id}>
                <button className={`list-mini-cover ${color}`} type="button" onClick={() => openBook(book)} title={`Open ${book.title}`}>
                  <Icon name="spark" size={16} />
                </button>
                <div className="list-row-main" onClick={() => openBook(book)}>
                  <div className="list-row-header">
                    <h3>{book.title}</h3>
                    {started.has(book.id) && <span className="test-started">Quiz active</span>}
                    {book.status === "processing" && <span className="test-started" style={{ background: "#f5a623" }}>Processing…</span>}
                  </div>
                  <div className="list-row-meta">
                    <span className="list-row-pages">{pages > 0 ? `${pages} pages` : book.file_name ?? "PDF Document"}</span>
                  </div>
                </div>
                <div className="list-row-actions">
                  <button type="button" className="btn-list-study" onClick={() => openBook(book)}>Study</button>
                  <button type="button" className="btn-take-test" onClick={() => startTest(book)}>Quiz</button>
                  <button type="button" className="book-delete" onClick={() => handleDelete(book.id)} disabled={deleting === book.id} aria-label="Delete book" title="Delete book">✕</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface TestQuestion {
  id: number;
  difficulty: "Basic" | "Medium" | "Advanced";
  kind: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  misconception: string;
}

interface TestResultSummary {
  concept: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  tierStats: {
    basic: { correct: number; total: number };
    medium: { correct: number; total: number };
    advanced: { correct: number; total: number };
  };
  wrongQuestions: Array<{
    question: TestQuestion;
    selectedIndex: number;
    userChoice: string;
    correctChoice: string;
  }>;
}

function generateConceptQuestions(concept: string, bookTitle: string, langCode: LanguageCode = "en"): TestQuestion[] {
  const baseQuestions: TestQuestion[] = [
    {
      id: 1,
      difficulty: "Basic",
      kind: "Definition",
      prompt: `Which statement best defines "${concept}" in the context of ${bookTitle}?`,
      options: [
        `The foundational framework and core rules that govern ${concept} throughout the subject.`,
        `A secondary optional add-on that has no impact on overall performance.`,
        `An obsolete technique that has been completely deprecated in modern setups.`,
        `A temporary placeholder applied only when no real information is available.`
      ],
      correctIndex: 0,
      explanation: `${concept} establishes the baseline rules, architectural definitions, and structural integrity for ${bookTitle}.`,
      misconception: `Assuming it is purely optional or incidental to the core structure.`
    },
    {
      id: 2,
      difficulty: "Basic",
      kind: "Core Objective",
      prompt: `What is the primary objective of understanding "${concept}"?`,
      options: [
        `To eliminate all computational hardware requirements.`,
        `To ensure predictable, reliable results by grounding reasoning in verified principles.`,
        `To avoid document reading and guess answers randomly.`,
        `To replace all human verification with untested automation.`
      ],
      correctIndex: 1,
      explanation: `The primary objective is predictable consistency and grounding reasoning in verified standards.`,
      misconception: `Believing ${concept} is designed to eliminate human oversight rather than enhance precision.`
    },
    {
      id: 3,
      difficulty: "Basic",
      kind: "Component Identification",
      prompt: `Which of the following is an essential building block of "${concept}"?`,
      options: [
        `Arbitrary unvalidated parameters.`,
        `Unstructured guesswork and disconnected theories.`,
        `Systematic evaluation, standardized criteria, and clear input validation.`,
        `Ignoring edge conditions and error signals.`
      ],
      correctIndex: 2,
      explanation: `Systematic evaluation and standardized criteria form the bedrock of ${concept}.`,
      misconception: `Treating informal approximations as equivalent to validated components.`
    },
    {
      id: 4,
      difficulty: "Basic",
      kind: "True or False",
      prompt: `True or False: In ${bookTitle}, "${concept}" requires rigorous verification before moving to downstream stages.`,
      options: [
        `True — Early verification prevents compounding errors in downstream stages.`,
        `False — Downstream stages never depend on upstream concept accuracy.`
      ],
      correctIndex: 0,
      explanation: `True. Catching discrepancies at the ${concept} stage prevents expensive downstream failures.`,
      misconception: `Believing downstream modules are isolated from upstream flaws.`
    },
    {
      id: 5,
      difficulty: "Medium",
      kind: "Practical Application",
      prompt: `When encountering an unexpected anomaly in ${bookTitle}, how should you apply "${concept}"?`,
      options: [
        `Immediately restart the entire system without checking logs or state.`,
        `Trace the anomaly back to the foundational ${concept} criteria and compare against the baseline.`,
        `Disable all validation checks so the anomaly goes unnoticed.`,
        `Assume the anomaly will self-correct without investigation.`
      ],
      correctIndex: 1,
      explanation: `Tracing discrepancies against established baseline criteria identifies the root cause accurately.`,
      misconception: `Relying on brute-force restarts without addressing root configuration causes.`
    },
    {
      id: 6,
      difficulty: "Medium",
      kind: "Method Comparison",
      prompt: `How does a structured approach to "${concept}" compare to ad-hoc empirical intuition?`,
      options: [
        `Structured ${concept} provides repeatable, measurable outcomes; ad-hoc intuition is brittle and non-deterministic.`,
        `Ad-hoc intuition is always faster and never introduces regressions.`,
        `There is no operational difference between the two approaches.`,
        `Structured methods cannot be documented or taught.`
      ],
      correctIndex: 0,
      explanation: `Standardized methods ensure reproducibility and deterministic error boundaries.`,
      misconception: `Confusing quick anecdotal shortcuts with reliable, robust methodologies.`
    },
    {
      id: 7,
      difficulty: "Medium",
      kind: "Process Workflow",
      prompt: `What is the optimal workflow step immediately after formulating a hypothesis regarding "${concept}"?`,
      options: [
        `Deploying directly to production with zero staging tests.`,
        `Validating the hypothesis with controlled test samples and verifying against known outputs.`,
        `Discarding the documentation and resetting all baseline metrics.`,
        `Assuming the hypothesis is infallible without empirical testing.`
      ],
      correctIndex: 1,
      explanation: `Controlled validation against known ground truth ensures hypotheses are sound before commitment.`,
      misconception: `Skipping validation under the assumption that theoretical formulation equals verification.`
    },
    {
      id: 8,
      difficulty: "Medium",
      kind: "Validation Metric",
      prompt: `Which indicator provides the strongest evidence of high mastery in "${concept}"?`,
      options: [
        `Consistently low error rates and fast recovery when encountering edge-case anomalies.`,
        `Memorizing keywords without being able to explain practical trade-offs.`,
        `Relying on external hints for every basic challenge.`,
        `Avoiding difficult questions completely.`
      ],
      correctIndex: 0,
      explanation: `Mastery is demonstrated by low error variance and swift adaptation during complex scenarios.`,
      misconception: `Equating rote keyword memorization with genuine conceptual mastery.`
    },
    {
      id: 9,
      difficulty: "Advanced",
      kind: "Critical Evaluation",
      prompt: `In high-throughput environments, what is the critical trade-off when optimizing "${concept}"?`,
      options: [
        `Balancing deep verification latency against rapid processing throughput without compromising safety.`,
        `Trading off all security mechanisms to gain minimal cosmetic speed.`,
        `Ignoring hardware specifications and assuming infinite compute.`,
        `Disabling all caching and forcing redundant computations.`
      ],
      correctIndex: 0,
      explanation: `The classic engineering trade-off is latency versus thoroughness of verification checks.`,
      misconception: `Assuming optimization can be achieved without acknowledging the throughput-safety balance.`
    },
    {
      id: 10,
      difficulty: "Advanced",
      kind: "System Synthesis",
      prompt: `When scaling "${concept}" across heterogeneous inputs, how do you prevent subtle drift or regressions?`,
      options: [
        `By freezing all models and refusing any future data updates.`,
        `By implementing automated regression suites, continuous calibration, and clear invariant assertions.`,
        `By turning off monitoring logs to reduce disk space.`,
        `By relying exclusively on manual spot-checks once a year.`
      ],
      correctIndex: 1,
      explanation: `Continuous calibration and automated regression suites keep performance aligned across diverse data distributions.`,
      misconception: `Believing initial calibration remains invariant indefinitely without ongoing regression testing.`
    }
  ];

  if (langCode === "en") return baseQuestions;

  const locMap: Record<string, { prompt1: string; exp1: string; prompt2: string; exp2: string }> = {
    ta: {
      prompt1: `"${bookTitle}" பாடத்தின் சூழலில் "${concept}" என்ற கருத்தை மிகச் சரியாக வரையறுப்பது எது?`,
      exp1: `"${concept}" என்பது ${bookTitle} பாடத்திற்கான அடிப்படை விதிகள் மற்றும் கட்டமைப்பு ஒருமைப்பாட்டை நிறுவுகிறது.`,
      prompt2: `"${concept}" என்ற கருத்தைப் புரிந்துகொள்வதன் முதன்மை நோக்கம் என்ன?`,
      exp2: `நிரூபிக்கப்பட்ட தரநிலைகளில் தர்க்கத்தை அடிப்படையாகக் கொண்டு நிலையான முடிவுகளை உறுதி செய்வதே இதன் முதன்மை நோக்கம்.`
    },
    hi: {
      prompt1: `"${bookTitle}" के संदर्भ में "${concept}" को सबसे अच्छी तरह कौन सा कथन परिभाषित करता है?`,
      exp1: `"${concept}" ${bookTitle} के लिए आधारभूत नियम और संरचनात्मक अखंडता स्थापित करता है।`,
      prompt2: `"${concept}" को समझने का प्राथमिक उद्देश्य क्या है?`,
      exp2: `सत्यापित मानकों पर तर्क को आधारित करके स्थिरता और विश्वसनीयता सुनिश्चित करना इसका प्राथमिक उद्देश्य है।`
    },
    mr: {
      prompt1: `"${bookTitle}" च्या संदर्भात "${concept}" ची सर्वात अचूक व्याख्या करणारे विधान कोणते?`,
      exp1: `"${concept}" हे ${bookTitle} साठी मूलभूत नियम आणि संरचनात्मक अखंडता स्थापित करते.`,
      prompt2: `"${concept}" समजून घेण्याचा मुख्य उद्देश काय आहे?`,
      exp2: `सत्यापित मानकांवर तर्क आधारित करून सुसंगतता सुनिश्चित करणे हा मुख्य उद्देश आहे.`
    },
    te: {
      prompt1: `"${bookTitle}" సందర్భంలో "${concept}"ను అత్యంత ఖచ్చితంగా నిర్వచించే ప్రకటన ఏది?`,
      exp1: `"${concept}" అనేది ${bookTitle} కోసం ప్రాథమిక నియమాలు మరియు నిర్మాణ సమగ్రతను ఏర్పాటు చేస్తుంది.`,
      prompt2: `"${concept}"ను అర్థం చేసుకోవడం యొక్క ప్రాథమిక లక్ష్యం ఏమిటి?`,
      exp2: `నిరూపిత ప్రమాణాలపై ఆధారపడి ఫలితాలను స్థిరీకరించడమే ప్రధాన లక్ష్యం.`
    },
    ml: {
      prompt1: `"${bookTitle}" എന്നതിൽ "${concept}" എന്നതിനെ ഏറ്റവും കൃത്യമായി നിർവചിക്കുന്ന പ്രസ്താവന ഏതാണ്?`,
      exp1: `"${concept}" ${bookTitle}-ന്റെ അടിസ്ഥാന നിയമങ്ങളും ഘടനാപരമായ സമഗ്രതയും സ്ഥാപിക്കുന്നു.`,
      prompt2: `"${concept}" മനസ്സിലാക്കുന്നതിന്റെ പ്രധാന ലക്ഷ്യം എന്താണ്?`,
      exp2: `സ്ഥിരീകരിച്ച മാനദണ്ഡങ്ങളിൽ സ്ഥിരത ഉറപ്പാക്കുക എന്നതാണ് പ്രധാന ലക്ഷ്യം.`
    },
    or: {
      prompt1: `"${bookTitle}" ପ୍ରସଙ୍ଗରେ "${concept}" କୁ ସର୍ବୋତ୍ତମ ଭାବରେ ବ୍ୟାଖ୍ୟା କରୁଥିବା ବିବୃତି କେଉଁଟି?`,
      exp1: `"${concept}" ${bookTitle} ପାଇଁ ମୌଳିକ ନିୟମ ଏବଂ ଗଠନମୂଳକ ଅଖଣ୍ଡତା ସ୍ଥାପନ କରେ।`,
      prompt2: `"${concept}" ବୁଝିବାର ମୁଖ୍ୟ ଉଦ୍ଦେଶ୍ୟ କ’ଣ?`,
      exp2: `ମାନକ ନୀତି ଉପରେ ନିର୍ଭର କରି ସ୍ଥିରତା ନିଶ୍ଚିତ କରିବା ମୁଖ୍ୟ ଉଦ୍ଦେଶ୍ୟ।`
    },
    bn: {
      prompt1: `"${bookTitle}"-এর প্রেক্ষাপটে "${concept}"-কে সবচেয়ে সঠিকভাবে সংজ্ঞায়িত করে এমন বিবৃতি কোনটি?`,
      exp1: `"${concept}" ${bookTitle}-এর জন্য ভিত্তিগত নিয়ম এবং কাঠামোগত অখণ্ডতা স্থাপন করে।`,
      prompt2: `"${concept}" বোঝার প্রাথমিক উদ্দেশ্য কী?`,
      exp2: `যাচাইকৃত মানের ওপর যুক্তি ভিত্তি করে ধারাবাহিকতা নিশ্চিত করাই মূল উদ্দেশ্য।`
    }
  };

  const loc = locMap[langCode];
  if (!loc) return baseQuestions;

  return baseQuestions.map((q) => {
    if (q.id === 1) {
      return { ...q, prompt: loc.prompt1, explanation: loc.exp1 };
    }
    if (q.id === 2) {
      return { ...q, prompt: loc.prompt2, explanation: loc.exp2 };
    }
    return q;
  });
}

function TestView({
  book,
  books = [],
  started,
  completed = new Set(),
  onStarted,
  onCompleted,
  onSelectBook,
  onDiscussInUpload,
}: {
  book: LearningBook;
  books?: LearningBook[];
  started: Set<number>;
  completed?: Set<number>;
  onStarted: (book: LearningBook) => void;
  onCompleted?: (book: LearningBook) => void;
  onSelectBook?: (book: LearningBook) => void;
  onDiscussInUpload?: (book: LearningBook, query: string) => void;
}) {
  const { t, languageObj } = useTranslation();
  const [currentBook, setCurrentBook] = useState<LearningBook>(book);
  const [concept, setConcept] = useState("");
  const [conceptIndex, setConceptIndex] = useState(0);
  const [question, setQuestion] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "in-progress" | "completed">("all");
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewTab, setReviewTab] = useState<"missed" | "all">("missed");

  // Challenge test state
  const [currentQuestions, setCurrentQuestions] = useState<TestQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [qIndex: number]: number }>({});
  const [testResult, setTestResult] = useState<TestResultSummary | null>(null);
  const [discussingQuestionId, setDiscussingQuestionId] = useState<number | null>(null);
  const [aiChatMessages, setAiChatMessages] = useState<{ [qId: number]: Array<{ sender: "ai" | "user"; text: string; loading?: boolean }> }>({});
  const [aiInputText, setAiInputText] = useState<{ [qId: number]: string }>({});

  // Track concept step progress per book: { [bookId: number]: number } (0 = step 1 active, 1 = step 2 unlocked, etc.)
  const [bookSteps, setBookSteps] = useState<{ [bookId: number]: number }>(() => {
    try {
      const saved = localStorage.getItem("aarva_concept_steps");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const getStepProgress = (bookId: number) => {
    if (completed?.has(bookId)) return 99; // All unlocked if book completed
    return bookSteps[bookId] ?? 0;
  };

  const advanceStepProgress = (bookId: number, completedIdx: number) => {
    setBookSteps((prev) => {
      const current = prev[bookId] ?? 0;
      const nextStep = Math.max(current, completedIdx + 1);
      const updated = { ...prev, [bookId]: nextStep };
      try {
        localStorage.setItem("aarva_concept_steps", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const openRoadmap = (targetBook: LearningBook) => {
    setCurrentBook(targetBook);
    onSelectBook?.(targetBook);
    setShowRoadmap(true);
    setTestResult(null);
  };

  useEffect(() => {
    if (book && book.id) {
      setCurrentBook(book);
    }
  }, [book]);

  const activeBook = currentBook?.id ? currentBook : (books[0] || book);

  const begin = (item: string, targetBook?: LearningBook, idx?: number) => {
    const chosen = targetBook || activeBook;
    setCurrentBook(chosen);
    onSelectBook?.(chosen);
    setConcept(item);
    setConceptIndex(idx ?? 0);
    setQuestion(0);
    setAnswered(false);
    setScore(0);
    setUserAnswers({});
    setTestResult(null);
    setDiscussingQuestionId(null);
    const qList = generateConceptQuestions(item, chosen.title, languageObj.code);
    setCurrentQuestions(qList);
    onStarted(chosen);
  };

  useEffect(() => {
    if (concept) {
      const qList = generateConceptQuestions(concept, activeBook.title, languageObj.code);
      setCurrentQuestions(qList);
    }
  }, [languageObj.code]);

  const handleSelectAnswer = (optIdx: number) => {
    if (answered) return;
    const currentQ = currentQuestions[question];
    if (!currentQ) return;

    const isCorrect = optIdx === currentQ.correctIndex;
    setUserAnswers((prev) => ({ ...prev, [question]: optIdx }));
    setAnswered(true);
    if (isCorrect) {
      setScore((s) => s + 10);
    }
  };

  const handleNextQuestion = () => {
    if (question < currentQuestions.length - 1) {
      setQuestion((q) => q + 1);
      setAnswered(false);
    } else {
      handleFinishTest();
    }
  };

  const handleFinishTest = () => {
    if (currentQuestions.length === 0) return;

    let correctCount = 0;
    let incorrectCount = 0;
    const wrongQuestions: TestResultSummary["wrongQuestions"] = [];
    const tierStats = {
      basic: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      advanced: { correct: 0, total: 0 },
    };

    currentQuestions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      const tierKey = q.difficulty.toLowerCase() as "basic" | "medium" | "advanced";
      tierStats[tierKey].total += 1;

      if (selected !== undefined && selected === q.correctIndex) {
        correctCount += 1;
        tierStats[tierKey].correct += 1;
      } else {
        incorrectCount += 1;
        wrongQuestions.push({
          question: q,
          selectedIndex: selected !== undefined ? selected : -1,
          userChoice: selected !== undefined && q.options[selected] ? q.options[selected] : "Not answered",
          correctChoice: q.options[q.correctIndex],
        });
      }
    });

    const percentage = Math.round((correctCount / currentQuestions.length) * 100);
    const passed = percentage >= 70;

    // Upon completing the test, advance progress so the next test/stage unlocks
    advanceStepProgress(activeBook.id, conceptIndex);
    const conceptsList = activeBook.concepts ?? ["Key Concepts", "Core Ideas", "Definitions", "Important Notes"];
    if (conceptIndex + 1 >= conceptsList.length) {
      onCompleted?.(activeBook);
    }

    setTestResult({
      concept,
      totalQuestions: currentQuestions.length,
      correctCount,
      incorrectCount,
      score: correctCount * 10,
      maxScore: currentQuestions.length * 10,
      percentage,
      passed,
      tierStats,
      wrongQuestions,
    });
    setConcept(""); // Exit question player to show testResult
  };

  const toggleDiscussion = (q: TestQuestion, userChoice?: string, correctChoice?: string) => {
    if (discussingQuestionId === q.id) {
      setDiscussingQuestionId(null);
      return;
    }
    setDiscussingQuestionId(q.id);
    if (!aiChatMessages[q.id] || aiChatMessages[q.id].length === 0) {
      let welcome = "";
      if (userChoice && correctChoice) {
        if (userChoice === correctChoice) {
          welcome = `Great job! You answered Question #${q.id} correctly. ${q.explanation}. Ask me any follow-up questions, analogies, or practical examples to master this concept!`;
        } else {
          welcome = `Hello! Let's clear up this concept together: In Question #${q.id}, you selected "${userChoice}". A common misconception is that ${q.misconception}. However, the correct answer is "${correctChoice}" because ${q.explanation}. Ask me anything to clarify your doubts!`;
        }
      } else {
        welcome = `Hi! I'm your AARVA AI Tutor for Question #${q.id}: "${q.prompt}". Need a hint, analogy, or conceptual breakdown? Ask me anything!`;
      }
      setAiChatMessages((prev) => ({
        ...prev,
        [q.id]: [{ sender: "ai", text: welcome }],
      }));
    }
  };

  const sendTutorQuery = async (
    q: TestQuestion,
    userChoice?: string,
    correctChoice?: string,
    overrideText?: string
  ) => {
    const text = (overrideText || aiInputText[q.id] || "").trim();
    if (!text) return;

    const current = aiChatMessages[q.id] || [];
    setAiChatMessages((prev) => ({
      ...prev,
      [q.id]: [
        ...current,
        { sender: "user", text },
        { sender: "ai", text: "Analyzing your question and preparing explanation…", loading: true },
      ],
    }));
    setAiInputText((prev) => ({ ...prev, [q.id]: "" }));

    const activeConceptName = testResult?.concept || concept || activeBook.title || "this concept";

    try {
      let promptQuery = "";
      if (userChoice && correctChoice) {
        promptQuery = `The student is taking/reviewing a test on '${activeConceptName}' from '${activeBook.title}'. In question: "${q.prompt}", the student selected "${userChoice}", correct answer is "${correctChoice}". Student asks: "${text}". Explain clearly, resolve any confusion, and provide a helpful, intuitive explanation.`;
      } else {
        promptQuery = `The student is currently answering a test question on '${activeConceptName}' from '${activeBook.title}'. Question: "${q.prompt}". Options: ${q.options.join(" | ")}. The student asks: "${text}". Provide a gentle, patient tutor hint and conceptual explanation without bluntly spoiling the exact answer.`;
      }

      // Format previous thread messages for multi-turn conversation
      const historyPayload = current.slice(-6).map((m) => ({
        role: m.sender === "ai" ? "assistant" : "user",
        content: m.text,
      }));

      const res = await apiFetch<any>("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          query: promptQuery,
          textbook_id: activeBook?.id || 1,
          user_id: 1,
          language: languageObj.name,
          conversation_history: historyPayload,
        }),
      });

      const answer =
        res.response ||
        res.answer ||
        `In ${activeConceptName}, ${q.explanation}. ${q.misconception ? `Remember: ${q.misconception}.` : ""}`;

      setAiChatMessages((prev) => ({
        ...prev,
        [q.id]: [
          ...(prev[q.id] || []).filter((m) => !m.loading),
          { sender: "ai", text: answer },
        ],
      }));
    } catch {
      const fallback = `In ${activeConceptName}, ${q.explanation}. ${
        q.misconception ? `Keep in mind: ${q.misconception}.` : "Focus on evaluating foundational principles."
      }`;
      setAiChatMessages((prev) => ({
        ...prev,
        [q.id]: [
          ...(prev[q.id] || []).filter((m) => !m.loading),
          { sender: "ai", text: fallback },
        ],
      }));
    }
  };

  const isBookCompleted = (b: LearningBook) => {
    return completed?.has(b.id) || (b.progress ?? 0) >= 100;
  };

  const isBookInProgress = (b: LearningBook) => {
    if (isBookCompleted(b)) return false;
    return started.has(b.id) || (b.progress ?? 0) > 0;
  };

  const searchTokens = useMemo(() => {
    return searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  }, [searchQuery]);

  const matchesBookSearch = (item: LearningBook, tokens: string[]) => {
    if (tokens.length === 0) return true;
    const title = (item.title || "").toLowerCase();
    const author = (item.author || "").toLowerCase();
    const subject = (item.subject || "").toLowerCase();
    const fileName = (item.file_name || "").toLowerCase();
    const concepts = (item.concepts || []).map((c) => c.toLowerCase());

    return tokens.every((token) => (
      title.includes(token) ||
      author.includes(token) ||
      subject.includes(token) ||
      fileName.includes(token) ||
      concepts.some((c) => c.includes(token))
    ));
  };

  const getMatchingConcepts = (item: LearningBook, tokens: string[]) => {
    if (tokens.length === 0) return [];
    return (item.concepts || []).filter((c) => {
      const cLow = c.toLowerCase();
      return tokens.some((t) => cLow.includes(t));
    });
  };

  const matchingBooks = useMemo(() => {
    return books.filter((b) => matchesBookSearch(b, searchTokens));
  }, [books, searchTokens]);

  const allCount = matchingBooks.length;
  const inProgressCount = matchingBooks.filter(isBookInProgress).length;
  const completedCount = matchingBooks.filter(isBookCompleted).length;

  const filteredBooks = useMemo(() => {
    return matchingBooks.filter((item) => {
      if (filterMode === "completed") return isBookCompleted(item);
      if (filterMode === "in-progress") return isBookInProgress(item);
      return true;
    });
  }, [matchingBooks, filterMode]);

  /* ── 1. ACTIVE QUESTION PLAYER ── */
  if (concept && currentQuestions.length > 0) {
    const currentQ = currentQuestions[question] || currentQuestions[0];
    const isLast = question === currentQuestions.length - 1;
    const selectedOpt = userAnswers[question];
    const hasAnswered = selectedOpt !== undefined;
    const isCorrect = hasAnswered && selectedOpt === currentQ.correctIndex;

    return (
      <section className="game-view">
        <div className="game-top">
          <button type="button" onClick={() => { setConcept(""); setShowRoadmap(true); }}>← Roadmap</button>
          <div><span>{activeBook.title}</span><b>{concept} Challenge</b></div>
          <div className="game-score"><Icon name="spark" size={16} /> {score} XP</div>
        </div>

        <div className="question-progress">
          <span><i style={{ width: `${((question + 1) / currentQuestions.length) * 100}%` }} /></span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <small>Question {question + 1} of {currentQuestions.length}</small>
            <button
              id="finish-test-btn"
              data-testid="finish-test-btn"
              type="button"
              onClick={handleFinishTest}
              style={{ background: "none", border: "none", color: "var(--violet)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
            >
              Finish & view score
            </button>
          </div>
        </div>

        <div className="game-card">
          <div className="question-meta">
            <span className={`difficulty-badge ${currentQ.difficulty.toLowerCase()}`}>
              {currentQ.difficulty === "Basic" ? "🟢 Basic Level" : currentQ.difficulty === "Medium" ? "🟡 Medium Level" : "🔴 Advanced Level"}
            </span>
            <span style={{ background: "#f4f3ff", color: "var(--violet)" }}>{currentQ.kind}</span>
          </div>

          <p className="question-number">Challenge {String(question + 1).padStart(2, "0")} of {currentQuestions.length}</p>
          <h2>{currentQ.prompt}</h2>

          <div className="answer-grid">
            {currentQ.options.map((optText, optIndex) => {
              const letter = String.fromCharCode(65 + optIndex);
              const isSelected = selectedOpt === optIndex;

              return (
                <button
                  key={optIndex}
                  className={isSelected ? "selected" : ""}
                  type="button"
                  onClick={() => handleSelectAnswer(optIndex)}
                >
                  <span>{letter}</span>
                  {optText}
                </button>
              );
            })}
          </div>

          <div className="game-footer">
            <span>
              {isLast
                ? "Final challenge! Submit to reveal your test score, verify answers, and consult the AI Tutor."
                : "Select your answer and continue. Detailed explanations and the AI Tutor will be revealed upon test completion."}
            </span>
            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={!hasAnswered}
            >
              {isLast ? "Finish Test & Reveal Score 🎉" : "Next question"} <Icon name="arrow" size={16} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ── 2. SCORE & RESULTS SUMMARY VIEW WITH WRONG ANSWER AI DISCUSSION ── */
  if (testResult) {
    const conceptsList = activeBook.concepts ?? ["Key Concepts", "Core Ideas", "Definitions", "Important Notes"];
    const hasNextConcept = conceptIndex + 1 < conceptsList.length;

    return (
      <section className="test-results-view">
        <button
          type="button"
          className="roadmap-back-btn"
          onClick={() => { setTestResult(null); setShowRoadmap(true); }}
        >
          ← Back to Learning Roadmap
        </button>

        {/* Score & Mastery Banner */}
        <div className="test-score-card">
          <div className="score-main-info">
            <div className="score-circle-badge">
              <b>{testResult.percentage}%</b>
              <small>Accuracy</small>
            </div>
            <div className="score-title-group">
              <span className={`test-badge ${testResult.passed ? "completed" : "in-progress"}`}>
                {testResult.passed ? "Concept Mastered 🏆" : "Review Recommended 📚"}
              </span>
              <h2>{testResult.concept} Test Results</h2>
              <p>
                You answered <b>{testResult.correctCount} of {testResult.totalQuestions}</b> questions correctly across Basic, Medium, and Advanced levels.
              </p>
            </div>
          </div>
          <div className="score-xp-pill">
            <Icon name="spark" size={18} /> +{testResult.score} XP Earned
          </div>
        </div>

        {/* 3-Tier Difficulty Breakdown */}
        <div className="test-tier-grid">
          <div className="tier-stat-card">
            <div className="tier-stat-header basic">
              <span>🟢 Basic Level</span>
              <small>{testResult.tierStats.basic.total > 0 ? `${Math.round((testResult.tierStats.basic.correct / testResult.tierStats.basic.total) * 100)}%` : "0%"}</small>
            </div>
            <div className="tier-stat-number">{testResult.tierStats.basic.correct} / {testResult.tierStats.basic.total} Correct</div>
            <div className="tier-stat-track">
              <div
                className="tier-stat-bar basic"
                style={{ width: `${testResult.tierStats.basic.total > 0 ? (testResult.tierStats.basic.correct / testResult.tierStats.basic.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="tier-stat-card">
            <div className="tier-stat-header medium">
              <span>🟡 Medium Level</span>
              <small>{testResult.tierStats.medium.total > 0 ? `${Math.round((testResult.tierStats.medium.correct / testResult.tierStats.medium.total) * 100)}%` : "0%"}</small>
            </div>
            <div className="tier-stat-number">{testResult.tierStats.medium.correct} / {testResult.tierStats.medium.total} Correct</div>
            <div className="tier-stat-track">
              <div
                className="tier-stat-bar medium"
                style={{ width: `${testResult.tierStats.medium.total > 0 ? (testResult.tierStats.medium.correct / testResult.tierStats.medium.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="tier-stat-card">
            <div className="tier-stat-header advanced">
              <span>🔴 Advanced Level</span>
              <small>{testResult.tierStats.advanced.total > 0 ? `${Math.round((testResult.tierStats.advanced.correct / testResult.tierStats.advanced.total) * 100)}%` : "0%"}</small>
            </div>
            <div className="tier-stat-number">{testResult.tierStats.advanced.correct} / {testResult.tierStats.advanced.total} Correct</div>
            <div className="tier-stat-track">
              <div
                className="tier-stat-bar advanced"
                style={{ width: `${testResult.tierStats.advanced.total > 0 ? (testResult.tierStats.advanced.correct / testResult.tierStats.advanced.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Review & AI Discussion Section */}
        <div className="test-wrong-section">
          {(() => {
            const hasWrong = testResult.wrongQuestions.length > 0;
            const reviewQuestionsList = (reviewTab === "all" || !hasWrong)
              ? currentQuestions.map((q, idx) => ({
                  question: q,
                  selectedIndex: userAnswers[idx] !== undefined ? userAnswers[idx] : -1,
                  userChoice: userAnswers[idx] !== undefined && q.options[userAnswers[idx]] ? q.options[userAnswers[idx]] : "Not answered",
                  correctChoice: q.options[q.correctIndex],
                  isCorrect: userAnswers[idx] === q.correctIndex,
                }))
              : testResult.wrongQuestions.map((wq) => ({
                  ...wq,
                  isCorrect: false,
                }));

            const rTokens = reviewSearch.trim().toLowerCase().split(/\s+/).filter(Boolean);
            const filteredReviewQuestions = reviewQuestionsList.filter(({ question: wq, userChoice, correctChoice }) => {
              if (rTokens.length === 0) return true;
              const corpus = `${wq.prompt} ${wq.explanation} ${wq.misconception} ${userChoice} ${correctChoice} ${wq.difficulty} ${wq.kind}`.toLowerCase();
              return rTokens.every((token) => corpus.includes(token));
            });

            return (
              <>
                <div className="test-wrong-section-header">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.8rem" }}>
                    <div>
                      <h3>Review Challenges & Quick Chat with AI Tutor</h3>
                      <p>
                        {!hasWrong
                          ? "Flawless score! You answered every question correctly across all three tiers. Click 'Quick Chat with AI Tutor' on any challenge to explore real-world analogies, extensions, and practical applications."
                          : "Review your answers below. Open 'Quick Chat with AI Tutor' on any question to get immediate clarity, analogies, and step-by-step guidance."}
                      </p>
                    </div>

                    {hasWrong && (
                      <div className="filter-chips-group test-filter-chips" role="group" aria-label="Review filter">
                        <button
                          type="button"
                          className={`filter-chip ${reviewTab === "missed" ? "active" : ""}`}
                          onClick={() => setReviewTab("missed")}
                        >
                          Missed ({testResult.wrongQuestions.length})
                        </button>
                        <button
                          type="button"
                          className={`filter-chip ${reviewTab === "all" ? "active" : ""}`}
                          onClick={() => setReviewTab("all")}
                        >
                          All Questions ({testResult.totalQuestions})
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {reviewQuestionsList.length > 1 && (
                  <div className="results-search-wrap">
                    <div className="library-search-box filter-search results-search-box">
                      <span className="search-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Search questions, concepts, or explanations..."
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setReviewSearch("");
                        }}
                        aria-label="Search review questions"
                      />
                      {reviewSearch && (
                        <button
                          type="button"
                          className="search-clear-btn"
                          onClick={() => setReviewSearch("")}
                          aria-label="Clear review search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {reviewSearch && (
                      <small style={{ color: "#736d8d", fontWeight: 600 }}>
                        Showing {filteredReviewQuestions.length} of {reviewQuestionsList.length} questions
                      </small>
                    )}
                  </div>
                )}

                {filteredReviewQuestions.length === 0 ? (
                  <div className="test-empty-state" style={{ margin: "1rem 0", padding: "1.8rem 1rem" }}>
                    <p>No questions matching "{reviewSearch}".</p>
                    <button
                      type="button"
                      className="roadmap-back-btn"
                      style={{ margin: "0.4rem 0 0" }}
                      onClick={() => setReviewSearch("")}
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="test-wrong-cards-list">
                    {filteredReviewQuestions.map(({ question: wq, userChoice, correctChoice, isCorrect, selectedIndex }) => {
                      const isDiscussing = discussingQuestionId === wq.id;
                      const thread = aiChatMessages[wq.id] || [];
                      const isThinking = thread.some((m) => m.loading);

                      return (
                        <div className={`test-wrong-card ${isCorrect ? "card-correct" : ""}`} key={wq.id}>
                          <div className="test-wrong-top">
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span className={`difficulty-badge ${wq.difficulty.toLowerCase()}`}>
                                {wq.difficulty === "Basic" ? "🟢 Basic" : wq.difficulty === "Medium" ? "🟡 Medium" : "🔴 Advanced"}
                              </span>
                              {isCorrect ? (
                                <span className="test-badge completed" style={{ fontSize: "0.62rem" }}>✓ Correct</span>
                              ) : (
                                <span className="test-badge in-progress" style={{ fontSize: "0.62rem" }}>Needs Review</span>
                              )}
                            </div>
                            <small style={{ color: "#9ca3af", fontWeight: 600 }}>Question #{wq.id}</small>
                          </div>

                          <h4>{wq.prompt}</h4>

                          <div className="answer-comparison-row">
                            <div className={`answer-chip ${isCorrect ? "correct" : "wrong"}`}>
                              <span>{isCorrect ? "✓ Your Selection:" : "❌ Your Selection:"}</span> <b>{userChoice}</b>
                            </div>
                            {!isCorrect && (
                              <div className="answer-chip correct">
                                <span>✓ Correct Answer:</span> <b>{correctChoice}</b>
                              </div>
                            )}
                          </div>

                          {/* All Options Breakdown */}
                          <div className="review-options-list">
                            <p className="review-options-title">All Options Breakdown:</p>
                            {wq.options.map((optText, optIdx) => {
                              const letter = String.fromCharCode(65 + optIdx);
                              const isThisCorrect = optIdx === wq.correctIndex;
                              const isThisUserChoice = userChoice === optText || selectedIndex === optIdx;

                              let optClass = "review-opt-neutral";
                              if (isThisCorrect) optClass = "review-opt-correct";
                              else if (isThisUserChoice) optClass = "review-opt-user-wrong";

                              return (
                                <div key={optIdx} className={`review-opt-item ${optClass}`}>
                                  <div className="review-opt-header">
                                    <span className="review-opt-letter">{letter}</span>
                                    <span className="review-opt-text">{optText}</span>
                                    {isThisCorrect && (
                                      <span className="review-badge-correct">
                                        ✓ Correct Answer
                                      </span>
                                    )}
                                    {isThisUserChoice && !isThisCorrect && (
                                      <span className="review-badge-user-wrong">
                                        ❌ Your Choice (Incorrect)
                                      </span>
                                    )}
                                    {isThisUserChoice && isThisCorrect && (
                                      <span className="review-badge-user-correct">
                                        ✓ Your Choice (Correct)
                                      </span>
                                    )}
                                    {!isThisCorrect && !isThisUserChoice && (
                                      <span className="review-badge-distractor">
                                        ✕ Distractor
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Detailed Reasoning & Explanations */}
                          <div className="review-reasons-wrap">
                            <div className="review-reason-card correct-reason">
                              <div className="review-reason-badge">
                                <span>✓</span> Reason Why Option {String.fromCharCode(65 + wq.correctIndex)} is Correct:
                              </div>
                              <p>{wq.explanation}</p>
                            </div>

                            {wq.misconception && (
                              <div className="review-reason-card wrong-reason">
                                <div className="review-reason-badge">
                                  <span>⚠️</span> Why Wrong Options are Incorrect / Common Trap:
                                </div>
                                <p>{wq.misconception}</p>
                              </div>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                            <button
                              type="button"
                              className="btn-discuss-ai"
                              onClick={() => toggleDiscussion(wq, userChoice, correctChoice)}
                            >
                              <Icon name="spark" size={15} />
                              <span>{isDiscussing ? "✕ Close Quick Chat" : "💬 Quick Chat with AI Tutor"}</span>
                            </button>

                            <button
                              type="button"
                              className="btn-discuss-ai"
                              style={{
                                background: "linear-gradient(135deg, #10b981, #059669)",
                                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
                              }}
                              onClick={() => {
                                const discussionPrompt = `I just finished taking the test on "${testResult?.concept || concept}" for "${activeBook.title}". In Question #${wq.id}: "${wq.prompt}", I answered "${userChoice}", but the correct answer is "${correctChoice}". The explanation notes: "${wq.explanation}". Could you please explain this concept in depth, clarify why my choice was incorrect, and give a real-world analogy?`;
                                if (onDiscussInUpload) {
                                  onDiscussInUpload(activeBook, discussionPrompt);
                                } else {
                                  window.dispatchEvent(new CustomEvent("aarva_discuss_in_upload", {
                                    detail: { book: activeBook, query: discussionPrompt }
                                  }));
                                }
                              }}
                              title="Move to the related textbook chat workspace in Upload session to discuss this question in depth"
                            >
                              <span>📖</span>
                              <span>Discuss in Book Chat →</span>
                            </button>
                          </div>

                          {/* Inline AI Quick Chat Drawer */}
                          {isDiscussing && (
                            <div className="ai-discuss-drawer">
                              <div className="ai-discuss-header">
                                <Icon name="spark" size={16} /> 💬 Quick Chat • AARVA AI Tutor
                              </div>

                              <div
                                className="ai-chat-thread"
                                ref={(el) => {
                                  if (el) {
                                    el.scrollTop = el.scrollHeight;
                                  }
                                }}
                              >
                                {thread.map((msg, mIdx) => (
                                  <div key={mIdx} className={`ai-bubble ${msg.sender}`}>
                                    {msg.loading ? (
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                                        <Icon name="spark" size={14} /> Thinking and preparing clear explanation…
                                      </span>
                                    ) : (
                                      msg.text
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Quick Prompt Suggestion Chips */}
                              <div className="ai-quick-prompts">
                                <button
                                  type="button"
                                  className="ai-prompt-chip"
                                  disabled={isThinking}
                                  onClick={() =>
                                    sendTutorQuery(
                                      wq,
                                      userChoice,
                                      correctChoice,
                                      "Can you explain this concept in simpler terms with a clear real-world analogy?"
                                    )
                                  }
                                >
                                  💡 Explain with analogy
                                </button>
                                {!isCorrect && (
                                  <button
                                    type="button"
                                    className="ai-prompt-chip"
                                    disabled={isThinking}
                                    onClick={() =>
                                      sendTutorQuery(
                                        wq,
                                        userChoice,
                                        correctChoice,
                                        `Why is "${userChoice}" incorrect and why is "${correctChoice}" the best choice?`
                                      )
                                    }
                                  >
                                    🔍 Why was my answer wrong?
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="ai-prompt-chip"
                                  disabled={isThinking}
                                  onClick={() =>
                                    sendTutorQuery(
                                      wq,
                                      userChoice,
                                      correctChoice,
                                      "Can you give me a practical real-world example of how this concept is applied in production or real life?"
                                    )
                                  }
                                >
                                  📖 Practical example
                                </button>
                                <button
                                  type="button"
                                  className="ai-prompt-chip"
                                  disabled={isThinking}
                                  onClick={() =>
                                    sendTutorQuery(
                                      wq,
                                      userChoice,
                                      correctChoice,
                                      "What is a simple rule of thumb or memory trick to never confuse this on exams?"
                                    )
                                  }
                                >
                                  🧠 Memory rule of thumb
                                </button>
                              </div>

                              <form
                                className="ai-input-wrap"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!isThinking) {
                                    sendTutorQuery(wq, userChoice, correctChoice);
                                  }
                                }}
                              >
                                <input
                                  type="text"
                                  placeholder={
                                    isThinking
                                      ? "AI Tutor is analyzing your question…"
                                      : "Ask AI Tutor to clarify this question or give an intuition..."
                                  }
                                  value={aiInputText[wq.id] || ""}
                                  disabled={isThinking}
                                  onChange={(e) => setAiInputText({ ...aiInputText, [wq.id]: e.target.value })}
                                />
                                <button
                                  type="submit"
                                  disabled={isThinking || !(aiInputText[wq.id] || "").trim()}
                                  style={{
                                    opacity: isThinking || !(aiInputText[wq.id] || "").trim() ? 0.6 : 1,
                                    cursor: isThinking || !(aiInputText[wq.id] || "").trim() ? "not-allowed" : "pointer"
                                  }}
                                >
                                  {isThinking ? "Thinking…" : "Ask Tutor"}
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Action Buttons */}
        <div className="test-results-actions">
          {/* ── Re-Test button — always available ── */}
          <button
            type="button"
            className="btn-results-secondary btn-retest-action"
            onClick={() => begin(testResult.concept, activeBook, conceptIndex)}
            title="Take this test again with fresh questions to strengthen your understanding"
          >
            🔁 Re-Test This Concept
          </button>

          {/* ── Continue to next concept / test ── */}
          {hasNextConcept && (
            <button
              type="button"
              className="btn-results-primary"
              onClick={() => {
                const nextIdx = conceptIndex + 1;
                const nextConcept = conceptsList[nextIdx];
                begin(nextConcept, activeBook, nextIdx);
              }}
            >
              <span>Continue to Next Test → {conceptsList[conceptIndex + 1]}</span>
              <Icon name="arrow" size={16} />
            </button>
          )}

          <button
            type="button"
            className="btn-results-secondary"
            style={{
              borderColor: "#7458f5",
              color: "#6366f1",
              background: "#f5f3ff",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem"
            }}
            onClick={() => {
              const fullTestQuery = `I just finished the test on "${testResult.concept}" from "${activeBook.title}". I scored ${testResult.score}/${testResult.maxScore} (${testResult.percentage}%). ${
                testResult.wrongQuestions.length > 0
                  ? `I missed ${testResult.wrongQuestions.length} questions on: ${testResult.wrongQuestions.map((wq) => `"${wq.question.prompt.slice(0, 60)}..."`).join(", ")}.`
                  : "I got 100% correct!"
              } Can we review this topic together and explore advanced insights and practical exam tips?`;
              if (onDiscussInUpload) {
                onDiscussInUpload(activeBook, fullTestQuery);
              } else {
                window.dispatchEvent(new CustomEvent("aarva_discuss_in_upload", {
                  detail: { book: activeBook, query: fullTestQuery }
                }));
              }
            }}
            title="Open AI Tutor in Upload session with complete test context"
          >
            <span>💬</span> Discuss Test in Book Chat
          </button>

          <button
            type="button"
            className="btn-results-secondary"
            onClick={() => { setTestResult(null); setShowRoadmap(true); }}
          >
            Back to Roadmap
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="tests-view">
      <div className="page-intro">
        <div>
          <p className="kicker">Practice arena</p>
          <h2>Turn every concept into a challenge.</h2>
          <p>Each concept creates a 50-question journey from easy recall to advanced reasoning.</p>
        </div>
        <div className="test-total"><Icon name="spark" /><span><b>8 types</b><small>of interactive questions</small></span></div>
      </div>

      {showRoadmap ? (
        /* ── Road Map View (only after clicking Start Test) ── */
        <div className="test-layout">
          <div style={{ width: "100%" }}>
            <button
              type="button"
              className="roadmap-back-btn"
              onClick={() => {
                setShowRoadmap(false);
                setSearchQuery("");
                setFilterMode("all");
              }}
            >
              ← Back to all tests
            </button>

            <div className="roadmap-hero-card">
              <div className="roadmap-hero-top">
                <span className={`mini-cover ${activeBook.color || "violet"}`}><MiniIcon name="book" /></span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <small style={{ textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-soft)", fontWeight: 700 }}>Learning Roadmap</small>
                    {isBookCompleted(activeBook) ? (
                      <span className="test-badge completed">Completed</span>
                    ) : isBookInProgress(activeBook) ? (
                      <span className="test-badge in-progress">In Progress</span>
                    ) : (
                      <span className="test-badge not-started">Not Started</span>
                    )}
                  </div>
                  <h3>{activeBook.title}</h3>
                </div>
              </div>
              <p className="roadmap-hero-caption">
                Take each challenge in order to master the concepts progressively. Each stage unlocks after completing the previous concept challenge.
              </p>
              {(() => {
                const conceptsList = activeBook.concepts ?? ["Key Concepts", "Core Ideas", "Definitions", "Important Notes"];
                const currentStep = getStepProgress(activeBook.id);
                const unlockedCount = isBookCompleted(activeBook) ? conceptsList.length : Math.min(conceptsList.length, currentStep + 1);
                const pct = Math.round((Math.min(conceptsList.length, currentStep) / conceptsList.length) * 100);
                return (
                  <div className="roadmap-progress-summary">
                    <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "24rem" }}>
                      <span>Stage <b>{unlockedCount} of {conceptsList.length}</b> unlocked</span>
                      <b>{pct}% mastered</b>
                    </div>
                    <div className="roadmap-progress-track">
                      <div className="roadmap-progress-bar" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>

            <article className="concept-map" style={{ padding: "1.8rem 1.6rem" }}>
              <div className="card-title" style={{ marginBottom: "1rem" }}>
                <div>
                  <p className="kicker">Orderly concept progression</p>
                  <h3>Master concepts step-by-step</h3>
                </div>
              </div>

              {/* ── Step-by-Step Concept Progression ── */}
              {(() => {
                const conceptsList = activeBook.concepts ?? ["Key Concepts", "Core Ideas", "Definitions", "Important Notes"];
                const currentStep = getStepProgress(activeBook.id);
                const isFinished = isBookCompleted(activeBook);

                return (
                  <div className="concept-path" style={{ margin: "0 auto", maxWidth: "100%" }}>
                    {conceptsList.map((item, index) => {
                      const isCompleted = isFinished || index < currentStep;
                      const isCurrent = !isFinished && index === currentStep;
                      const isLocked = !isFinished && index > currentStep;

                      return (
                        <button
                          type="button"
                          key={item}
                          disabled={isLocked}
                          className={`concept-step-item ${isCompleted ? "completed" : isCurrent ? "active" : "locked"}`}
                          onClick={() => !isLocked && begin(item, activeBook, index)}
                          title={isLocked ? `Complete step ${index} first to unlock this concept` : `Start ${item}`}
                        >
                          <span>
                            {isCompleted ? "✓" : index + 1}
                          </span>
                          <div>
                            <b>{item}</b>
                            <small>
                              {isCompleted
                                ? "Completed ✓ • Click to Re-Test and improve your score"
                                : isCurrent
                                ? "Active • Basic → Medium → Advanced questions"
                                : `Locked • Complete step ${index} first`}
                            </small>
                          </div>
                          <em className={isCurrent ? "start-active" : isCompleted ? "retake-btn" : "locked-btn"}>
                            {isCompleted ? "🔁 Re-Test ↺" : isCurrent ? "Start Challenge →" : "Locked 🔒"}
                          </em>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </article>
          </div>
        </div>
      ) : (
        /* ── Tests Overview: List of Tests by book ── */
        <>
          {/* ── Test Search & Filters Bar ── */}
          <div className="test-filter-bar">
            <div className="library-search-box filter-search test-search-box">
              <span className="search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search tests by book title, concept, subject, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchQuery("");
                }}
                aria-label="Search tests"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-chips-group test-filter-chips" role="group" aria-label="Filter tests by status">
              <button
                type="button"
                className={`filter-chip ${filterMode === "all" ? "active" : ""}`}
                onClick={() => setFilterMode("all")}
              >
                All <span>({allCount})</span>
              </button>
              <button
                type="button"
                className={`filter-chip ${filterMode === "in-progress" ? "active" : ""}`}
                onClick={() => setFilterMode("in-progress")}
              >
                In Progress <span>({inProgressCount})</span>
              </button>
              <button
                type="button"
                className={`filter-chip ${filterMode === "completed" ? "active" : ""}`}
                onClick={() => setFilterMode("completed")}
              >
                Completed <span>({completedCount})</span>
              </button>
            </div>
          </div>

          {books.length === 0 ? (
            <div className="test-empty-state">
              <div className="library-empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7458f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h3>No textbooks uploaded yet</h3>
              <p>Upload your textbook or syllabus first to generate concept quizzes and practice tests.</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="test-empty-state">
              <div className="library-empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7458f5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <h3>No tests match your filter</h3>
              <p>
                {searchQuery
                  ? `No tests found matching "${searchQuery}". Try searching by another concept, author, or subject.`
                  : filterMode === "in-progress"
                  ? "You don't have any tests in progress right now. Start a test below to begin tracking!"
                  : filterMode === "completed"
                  ? "No completed tests yet. Complete a concept challenge to mark tests as finished!"
                  : "No tests found."}
              </p>
              <button
                className="auth-primary"
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFilterMode("all");
                }}
                style={{ maxWidth: "15rem", margin: "0.5rem auto 0" }}
              >
                Clear search & reset filters
              </button>
            </div>
          ) : (
            <div className="all-test-progress">
              <div className="card-title">
                <div>
                  <p className="kicker">Your progress</p>
                  <h3>
                    Tests by book ({filteredBooks.length}
                    {searchQuery ? ` matching "${searchQuery}"` : ""})
                  </h3>
                </div>
              </div>
              <div className="all-test-progress-list">
                {filteredBooks.map((item) => {
                  const isCompleted = isBookCompleted(item);
                  const inProgress = isBookInProgress(item);
                  const isSelected = activeBook && activeBook.id === item.id;
                  const pct = isCompleted ? 100 : inProgress ? Math.max(15, item.progress ?? 0) : 0;
                  const matchedConcepts = getMatchingConcepts(item, searchTokens);

                  return (
                    <div
                      className={`test-progress-row selectable ${isSelected ? "selected" : ""}`}
                      key={item.id}
                      onClick={() => {
                        setCurrentBook(item);
                        onSelectBook?.(item);
                      }}
                      title={`Click to select ${item.title}`}
                    >
                      <span className={`mini-cover ${item.color || "violet"}`}><MiniIcon name="book" /></span>
                      <div className="test-row-main">
                        <div className="test-row-header-wrap">
                          <b>{item.title}</b>
                        </div>
                        <div className="test-row-meta">
                          <span>{item.subject || "Textbook"}</span>
                          {item.author && (
                            <>
                              <span className="meta-dot">•</span>
                              <span>{item.author}</span>
                            </>
                          )}
                          <span className="meta-dot">•</span>
                          <span>{(item.concepts || []).length || 4} Concepts</span>
                          {(item.total_pages || item.pages) ? (
                            <>
                              <span className="meta-dot">•</span>
                              <span>{item.total_pages || item.pages} Pages</span>
                            </>
                          ) : null}
                        </div>
                        <i><span style={{ width: `${pct}%`, background: isCompleted ? "linear-gradient(90deg, #10b981, #059669)" : undefined }} /></i>
                        {matchedConcepts.length > 0 && (
                          <div className="test-matched-concepts" onClick={(e) => e.stopPropagation()}>
                            <span className="test-matched-label">Matched:</span>
                            {matchedConcepts.slice(0, 4).map((cName) => {
                              const cIdx = (item.concepts || []).indexOf(cName);
                              return (
                                <button
                                  type="button"
                                  key={cName}
                                  className="test-concept-chip"
                                  title={`Start test on ${cName}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    begin(cName, item, cIdx >= 0 ? cIdx : 0);
                                  }}
                                >
                                  <Icon name="spark" size={12} />
                                  <span>{cName}</span>
                                  <small style={{ opacity: 0.7, fontSize: "0.66rem" }}>→ Start</small>
                                </button>
                              );
                            })}
                            {matchedConcepts.length > 4 && (
                              <span style={{ fontSize: "0.72rem", color: "#7458f5", fontWeight: 600 }}>
                                +{matchedConcepts.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="test-row-actions">
                        {isCompleted ? (
                          <span className="test-badge completed">Completed</span>
                        ) : inProgress ? (
                          <span className="test-badge in-progress">In Progress</span>
                        ) : (
                          <span className="test-badge not-started">Not Started</span>
                        )}
                        <button
                          type="button"
                          className={`test-row-btn ${isSelected ? "primary" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openRoadmap(item);
                          }}
                        >
                          {isCompleted ? "🔁 Re-Test ↺" : inProgress ? "Continue →" : "Start Test →"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

interface StoredUserData {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  learner_type?: string;
  institution?: string;
  department?: string;
  year?: string;
  semester?: string;
  board?: string;
  class_grade?: string;
  job_role?: string;
  industry?: string;
  goals?: string[];
  subjects?: string[];
  personal_interests?: string[];
  streak_days?: number;
  completed_topics?: number;
  quiz_scores_avg?: number;
}

function ProfileView({ name, email, bookCount, user }: { name: string; email: string; bookCount: number; user?: StoredUserData | null }) {
  const { t, languageObj } = useTranslation();
  const firstName = (user?.name || name).split(" ")[0] || "there";
  const fullName = user?.name || name;
  const userEmailAddress = user?.email || email;
  const learnerType = user?.learner_type || "college";
  const streak = user?.streak_days || (learnerType === "school" ? 8 : learnerType === "professional" ? 5 : 12);
  const accuracy = user?.quiz_scores_avg ? Math.round(user.quiz_scores_avg) : (learnerType === "school" ? 84 : learnerType === "professional" ? 92 : 88);

  const educationLevelDisplay =
    learnerType === "school" ? "High School (CBSE)"
      : learnerType === "professional" ? "Working Professional & Enterprise"
        : "Undergraduate Degree";

  const fieldDisplay =
    user?.department || user?.job_role || (learnerType === "school" ? user?.class_grade || "Class 11 Science" : learnerType === "professional" ? "Senior Cloud Solutions Architect" : "Computer Science & Engineering");

  const institutionDisplay =
    user?.institution || (learnerType === "school" ? "Delhi Public School, R.K. Puram" : learnerType === "professional" ? "TechCorp Cloud Solutions" : "Indian Institute of Technology, Madras");

  const goalsDisplay =
    user?.goals && user.goals.length > 0 ? user.goals.join(" • ") : "30 minutes daily focused learning";

  const interestsDisplay =
    user?.personal_interests && user.personal_interests.length > 0
      ? user.personal_interests.join(", ")
      : user?.subjects && user.subjects.length > 0
        ? user.subjects.join(", ")
        : "AI, Software Architecture, System Design";

  const heatmap = Array.from({ length: 161 }, (_, index) => {
    // Show activity only for the first 63 days, rest empty
    if (index < 63) {
      return index % 13 === 0 ? 4 : index % 7 === 0 ? 3 : index % 5 === 0 ? 2 : index % 3 === 0 ? 1 : 0;
    }
    return 0;
  });

  return (
    <section className="profile-view">
      <article className="profile-hero-card">
        <div className="profile-avatar-large">{firstName[0]}</div>
        <div className="profile-identity">
          <p className="kicker">Learner profile ({educationLevelDisplay})</p>
          <h2>{fullName}</h2>
          <span>{institutionDisplay} · Active {streak}-day study streak</span>
          <div>
            <em>{bookCount * 80 + streak * 20} points</em>
            <em>{bookCount > 0 ? `${bookCount} textbook${bookCount > 1 ? "s" : ""}` : "No textbooks uploaded"}</em>
          </div>
        </div>
        <button type="button">Edit profile</button>
      </article>

      <div className="profile-card-grid">
        <article className="detail-card">
          <div className="detail-card-title"><span>P</span><div><p className="kicker">About you</p><h3>Personal details</h3></div><button type="button">Edit</button></div>
          <dl>
            <div><dt>Full name</dt><dd>{fullName}</dd></div>
            <div><dt>Email address</dt><dd>{userEmailAddress}</dd></div>
            <div><dt>{t("preferredLanguage")}</dt><dd>{languageObj.flag} {languageObj.nativeName} ({languageObj.name})</dd></div>
            <div><dt>Primary goal</dt><dd>{goalsDisplay}</dd></div>
            <div><dt>Study streak</dt><dd>{streak} consecutive days</dd></div>
          </dl>
        </article>

        <article className="detail-card">
          <div className="detail-card-title"><span>E</span><div><p className="kicker">Learning background</p><h3>Education & Role</h3></div><button type="button">Edit</button></div>
          <dl>
            <div><dt>Learner category</dt><dd>{educationLevelDisplay}</dd></div>
            <div><dt>Field / Domain</dt><dd>{fieldDisplay}</dd></div>
            <div><dt>Organization</dt><dd>{institutionDisplay}</dd></div>
            <div><dt>Interests</dt><dd>{interestsDisplay}</dd></div>
          </dl>
        </article>

        <aside className="profile-highlights">
          <p className="kicker">This month</p><h3>Learning highlights</h3>
          <div><span><MiniIcon name="clock" /></span><p><b>{streak * 3.2} hours</b><small>Focused learning</small></p></div>
          <div><span><MiniIcon name="book" /></span><p><b>{bookCount} books</b><small>In personal library</small></p></div>
          <div><span><MiniIcon name="test" /></span><p><b>{accuracy}% accuracy</b><small>Across completed quizzes</small></p></div>
          <blockquote>“A little progress each day adds up to remarkable results.”</blockquote>
        </aside>
      </div>

      <article className="heatmap-card">
        <div className="heatmap-heading"><div><p className="kicker">Learning consistency</p><h3>Your study activity</h3><span>Hours spent learning over the past 5 months</span></div><div className="heatmap-total"><strong>126.5</strong><small>total hours</small></div></div>
        <div className="heatmap-scroll">
          <div className="heatmap-months"><span>January</span><span>February</span><span>March</span><span>April</span><span>May</span></div>
          <div className="heatmap-layout">
            <div className="heatmap-days"><span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span></div>
            <div className="heatmap-grid">{heatmap.map((value, index) => <i className={`level-${value}`} title={`${value * 0.75} study hours`} key={index} />)}</div>
          </div>
        </div>
        <div className="heatmap-legend"><span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i className={`level-${level}`} key={level} />)}<span>More</span></div>
      </article>
    </section>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button className={`setting-toggle ${checked ? "on" : ""}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}><span /></button>;
}

function SettingsView({ name, email, user }: { name: string; email: string; user?: StoredUserData | null }) {
  const { t } = useTranslation();
  const [section, setSection] = useState("Learning");
  const [settings, setSettings] = useState({
    daily: true,
    weekly: true,
    streaks: true,
    recommendations: true,
    sounds: false,
    email: true,
    compact: false,
    publicProfile: false,
  });
  const [saved, setSaved] = useState(false);
  const update = (key: keyof typeof settings) => setSettings((current) => ({ ...current, [key]: !current[key] }));
  const displayName = user?.name || name;
  const displayEmail = user?.email || email;

  return (
    <section className="settings-view">
      <div className="settings-intro"><div><p className="kicker">{t("makeAarvaYours")}</p><h2>{t("settingsTitle")}</h2><p>{t("settingsSubtitle")}</p></div><button type="button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1800); }}>{saved ? t("changesSaved") : t("saveChanges")}</button></div>
      <div className="settings-layout">
        <nav className="settings-tabs" aria-label="Settings sections">
          {["Account", "Learning", "Notifications", "Appearance", "Privacy"].map((item) => <button className={section === item ? "active" : ""} type="button" onClick={() => setSection(item)} key={item}><span>{item[0]}</span>{item === "Learning" ? t("learningPreferences") : item}</button>)}
        </nav>

        <div className="settings-panels">
          {section === "Account" && <article className="settings-card"><div className="settings-card-heading"><div><h3>Account information</h3><p>Update the details connected to your Aarva account.</p></div><span className="settings-avatar">{displayName[0]}</span></div><div className="settings-fields"><label>Full name<input defaultValue={displayName} key={`name_${displayName}`} /></label><label>Email address<input type="email" defaultValue={displayEmail || `${displayName.split(" ")[0].toLowerCase()}@college.edu`} key={`email_${displayEmail}`} /></label><label>Current password<input type="password" placeholder="Enter current password" /></label><label>New password<input type="password" placeholder="Create a new password" /></label></div><div className="danger-zone"><div><b>Delete account</b><small>Permanently remove your profile and learning data.</small></div><button type="button">Delete account</button></div></article>}

          {section === "Learning" && <><article className="settings-card"><div className="settings-card-heading"><div><h3>{t("learningPreferences")}</h3><p>{t("learningSubtitle")}</p></div></div><div className="settings-fields"><label style={{ gridColumn: "1 / -1" }}>{t("preferredLanguage")}<LanguageSelector variant="select" /><small style={{ color: "#64748b", marginTop: "0.35rem", display: "block", fontSize: "0.78rem" }}>{t("preferredLanguageDesc")}</small></label><label>{t("dailyGoal")}<select defaultValue="30 minutes"><option>15 minutes</option><option>30 minutes</option><option>1 hour</option><option>2+ hours</option></select></label><label>{t("preferredStudyTime")}<select defaultValue="Evening"><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label><label>{t("questionDifficulty")}<select defaultValue="Adaptive"><option>Easy</option><option>Intermediate</option><option>Advanced</option><option>Adaptive</option></select></label><label>Weekly target<select defaultValue="5 days"><option>3 days</option><option>5 days</option><option>Every day</option></select></label></div></article><article className="settings-card"><div className="settings-card-heading"><div><h3>{t("smartLearning")}</h3><p>{t("smartLearningDesc")}</p></div></div><div className="setting-list"><div><span><b>{t("recommendations")}</b><small>{t("recommendationsDesc")}</small></span><Toggle checked={settings.recommendations} onChange={() => update("recommendations")} label={t("recommendations")} /></div><div><span><b>{t("studyStreaks")}</b><small>{t("studyStreaksDesc")}</small></span><Toggle checked={settings.streaks} onChange={() => update("streaks")} label={t("studyStreaks")} /></div><div><span><b>Answer sounds</b><small>Play subtle feedback sounds during tests.</small></span><Toggle checked={settings.sounds} onChange={() => update("sounds")} label="Answer sounds" /></div></div></article></>}

          {section === "Notifications" && <article className="settings-card"><div className="settings-card-heading"><div><h3>Notifications</h3><p>Stay encouraged without adding unnecessary noise.</p></div></div><div className="setting-list"><div><span><b>Daily study reminder</b><small>A gentle reminder at your preferred study time.</small></span><Toggle checked={settings.daily} onChange={() => update("daily")} label="Daily study reminder" /></div><div><span><b>Weekly progress recap</b><small>Your study hours, accuracy, and strongest concepts.</small></span><Toggle checked={settings.weekly} onChange={() => update("weekly")} label="Weekly recap" /></div><div><span><b>Email notifications</b><small>Receive account and learning updates by email.</small></span><Toggle checked={settings.email} onChange={() => update("email")} label="Email notifications" /></div></div><div className="quiet-hours"><span><MiniIcon name="clock" /></span><div><b>Quiet hours</b><small>Pause all reminders overnight</small></div><select defaultValue="10 PM – 7 AM"><option>10 PM – 7 AM</option><option>11 PM – 8 AM</option><option>Off</option></select></div></article>}

          {section === "Appearance" && <article className="settings-card"><div className="settings-card-heading"><div><h3>Appearance</h3><p>Keep the fixed Aarva palette while adjusting your workspace density.</p></div></div><div className="theme-preview"><div className="active"><span className="theme-light" /><b>Aarva light</b><small>Blush violet glass</small></div><div><span className="theme-focus" /><b>Focus mode</b><small>Coming soon</small></div></div><div className="setting-list"><div><span><b>Compact dashboard</b><small>Show more learning cards with tighter spacing.</small></span><Toggle checked={settings.compact} onChange={() => update("compact")} label="Compact dashboard" /></div></div></article>}

          {section === "Privacy" && <article className="settings-card"><div className="settings-card-heading"><div><h3>Privacy and data</h3><p>You stay in control of your profile and learning history.</p></div></div><div className="setting-list"><div><span><b>Public learner profile</b><small>Allow others to see your streaks and achievements.</small></span><Toggle checked={settings.publicProfile} onChange={() => update("publicProfile")} label="Public learner profile" /></div><div className="setting-action"><span><b>Download your data</b><small>Export your notes, activity, and test history.</small></span><button type="button">Request export</button></div><div className="setting-action"><span><b>Clear study history</b><small>Remove previous activity while keeping your books.</small></span><button type="button">Clear history</button></div></div></article>}
        </div>
      </div>
    </section>
  );
}

function Dashboard({ name, onHome }: { name: string; onHome: () => void }) {
  const { t } = useTranslation();
  // Read the stored user object once — used for user-specific data throughout
  const storedUser: StoredUserData | null = (() => { try { return JSON.parse(localStorage.getItem("aarva_user") || "null"); } catch { return null; } })();
  const userId = storedUser?.id;
  const userEmail: string = storedUser?.email || "";

  const getMenuLabel = (lbl: string) => {
    switch (lbl) {
      case "Dashboard": return t("dashboard");
      case "Library": return t("library");
      case "Upload": return t("upload");
      case "Tests": return t("tests");
      case "Settings": return t("settings");
      case "Profile": return t("profile");
      default: return lbl;
    }
  };

  const [collapsed, setCollapsed] = useState(() => (typeof window !== "undefined" ? window.innerWidth <= 860 : false));
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth <= 860 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 860);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [active, setActive] = useState("Dashboard");
  const [selectedBook, setSelectedBook] = useState<LearningBook | null>(null);
  const [startedTests, setStartedTests] = useState<Set<number>>(() => {
    try {
      const key = userId ? `aarva_started_tests_${userId}` : "aarva_started_tests";
      const saved = localStorage.getItem(key);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [completedTests, setCompletedTests] = useState<Set<number>>(() => {
    try {
      const key = userId ? `aarva_completed_tests_${userId}` : "aarva_completed_tests";
      const saved = localStorage.getItem(key);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [books, setBooks] = useState<LearningBook[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const firstName = (storedUser?.name || name).split(" ")[0] || "there";

  const handleStartTest = (b: LearningBook) => {
    setStartedTests((prev) => {
      const next = new Set(prev).add(b.id);
      const key = userId ? `aarva_started_tests_${userId}` : "aarva_started_tests";
      try { localStorage.setItem(key, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const handleCompleteTest = (b: LearningBook) => {
    setCompletedTests((prev) => {
      const next = new Set(prev).add(b.id);
      const key = userId ? `aarva_completed_tests_${userId}` : "aarva_completed_tests";
      try { localStorage.setItem(key, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  // ── Study Plan & Task Management ──
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState("30 min");
  const [customTasks, setCustomTasks] = useState<StudyTask[]>(() => {
    try {
      if (!userId) return [];
      const saved = localStorage.getItem(`aarva_tasks_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTaskText.trim();
    if (!trimmed) return;
    const newTask: StudyTask = {
      id: "task_" + Date.now(),
      text: trimmed,
      duration: newTaskDuration,
      completed: false,
    };
    setCustomTasks((prev) => {
      const updated = [newTask, ...prev];
      if (userId) {
        try { localStorage.setItem(`aarva_tasks_${userId}`, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
    setNewTaskText("");
    setShowAddTask(false);
  };

  const handleToggleTask = (taskId: string) => {
    setCustomTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      if (userId) {
        try { localStorage.setItem(`aarva_tasks_${userId}`, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      if (userId) {
        try { localStorage.setItem(`aarva_tasks_${userId}`, JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  // ── Load books from API ──────────────────────────────────────────────────
  const loadBooks = async () => {
    if (!userId) { setBooksLoading(false); return; } // no user → empty library
    setBooksLoading(true);
    try {
      const data: LearningBook[] = await apiFetch(`/api/textbooks/?user_id=${userId}`);
      const colored = data.map((b, i) => ({ ...b, color: COVER_COLORS[i % COVER_COLORS.length], concepts: ["Key Concepts", "Core Ideas", "Definitions", "Important Notes"] }));
      setBooks(colored);

      const activeKey = `aarva_active_book_id_${userId}`;
      const storedBookId = localStorage.getItem(activeKey) || localStorage.getItem("aarva_active_book_id");
      if (colored.length > 0) {
        setSelectedBook((prev) => {
          if (prev) {
            const updated = colored.find((b) => b.id === prev.id);
            if (updated) return updated;
          }
          if (storedBookId) {
            const found = colored.find((b) => String(b.id) === storedBookId);
            if (found) return found;
          }
          return colored[0];
        });
      } else {
        setSelectedBook(null);
      }
    } catch { /* quietly fail */ }
    setBooksLoading(false);
  };

  useEffect(() => { loadBooks(); }, [userId]);

  const selectBookAndSave = (b: LearningBook | null) => {
    setSelectedBook(b);
    if (b?.id && userId) {
      localStorage.setItem(`aarva_active_book_id_${userId}`, String(b.id));
    }
  };

  const openBook = (book: LearningBook) => { selectBookAndSave(book); setActive("Upload"); };
  const startTest = (book: LearningBook) => { selectBookAndSave(book); handleStartTest(book); setActive("Tests"); };
  const goUpload = () => { setActive("Upload"); };


  return (
    <div className={`dashboard-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="dash-nav">
        <div className="dash-brand">
          <Logo dark />
        </div>
        <div className="dash-menu">
          {menuItems.map((item) => (
            <button
              className={active === item.label ? "active" : ""}
              type="button"
              onClick={() => {
                setActive(item.label);
                if (window.innerWidth <= 860) setCollapsed(true);
              }}
              key={item.label}
            >
              <MiniIcon name={item.icon} />
              <span>{getMenuLabel(item.label)}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-quote"><Icon name="spark" /><p>One focused hour can change your whole week.</p></div>
        <div className="sidebar-bottom">
          <button
            className={`dash-bottom-btn ${active === "Settings" ? "active" : ""}`}
            type="button"
            onClick={() => {
              setActive("Settings");
              if (window.innerWidth <= 860) setCollapsed(true);
            }}
          >
            <MiniIcon name="settings" />
            <span>{t("settings")}</span>
          </button>
          <button className="signout" type="button" onClick={onHome}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>{t("logout")}</span>
          </button>
          <button
            className="sidebar-collapse-btn"
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {collapsed ? <path d="m9 18 6-6-6-6" /> : <path d="m15 18-6-6 6-6" />}
            </svg>
            <span>{collapsed ? "Expand" : "Collapse"}</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-top">
          <button className="mobile-sidebar-toggle" type="button" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar"><MiniIcon name="menu" /></button>
          <div>
            <p className="kicker">{t("myLearningSpace")}</p>
            <h1>{getMenuLabel(active)}</h1>
          </div>
          <div className="top-actions">
            <LanguageSelector variant="pill" />
            <div className="points"><Icon name="spark" size={16} /><span><b>{books.length * 80}</b><small>{t("points")}</small></span></div>
            <button className="notification" type="button" aria-label="Notifications"><MiniIcon name="bell" /><i /></button>
            <button className="profile-chip" type="button" onClick={() => setActive("Profile")}><span>{firstName[0]}</span><span><b>{firstName}</b><small>{t("curiousLearner")}</small></span></button>
          </div>
        </header>

        {active === "Dashboard" && <section className="dashboard-content">
          <div className="welcome-card">
            <div>
              <p>{t("welcomeBack")}, {firstName}</p>
              <h2>{t("readyToTurn")}</h2>
              <span>{t("quote")}</span>
              <button type="button" onClick={() => setActive("Library")}>{t("exploreLibrary")} <Icon name="arrow" size={17} /></button>
            </div>
          </div>
          <div className="metric-card accuracy"><span className="metric-icon"><MiniIcon name="test" /></span><div><small>{t("avgAccuracy")}</small><strong>87%</strong><p><b>+6%</b> this month</p></div><i><span /></i></div>
          <div className="metric-card books">
            <span className="metric-icon"><MiniIcon name="book" /></span>
            <div>
              <small>{t("booksUploaded")}</small>
              <strong>{booksLoading ? "…" : books.length}</strong>
              <p>{books.length > 0 ? `${books.length} in your library` : t("uploadFirstBook")}</p>
            </div>
            <div className="book-spines"><i /><i /><i /><i /></div>
          </div>

          <article className="study-plan">
            <div className="card-title">
              <div>
                <p className="kicker">{t("yourFocus")}</p>
                <h3>{t("todaysStudyPlan")}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTask((prev) => !prev)}
                style={{
                  background: showAddTask ? "rgba(116, 88, 245, 0.12)" : "var(--violet)",
                  color: showAddTask ? "var(--violet-deep)" : "#ffffff",
                  border: showAddTask ? "1px solid rgba(116, 88, 245, 0.25)" : "none",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "0.6rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  transition: "all 0.15s ease"
                }}
              >
                {showAddTask ? "✕ Close" : "+ Add task"}
              </button>
            </div>

            {showAddTask && (
              <form onSubmit={handleAddTask} className="add-task-form">
                <input
                  type="text"
                  placeholder="e.g. Read Chapter 2 & practice 15 quiz questions..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  autoFocus
                  className="add-task-input"
                />
                <div className="add-task-controls">
                  <select
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(e.target.value)}
                    className="add-task-duration"
                  >
                    <option value="15 min">15 min</option>
                    <option value="30 min">30 min</option>
                    <option value="45 min">45 min</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2+ hours">2+ hours</option>
                  </select>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="submit" className="add-task-submit">Add Task</button>
                    <button type="button" onClick={() => setShowAddTask(false)} className="add-task-cancel">Cancel</button>
                  </div>
                </div>
              </form>
            )}

            <div className="plan-list">
              {/* Custom user tasks */}
              {customTasks.map((task) => (
                <label key={task.id} className={task.completed ? "task-completed" : ""}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                  />
                  <span style={{ flex: 1 }}>
                    <b style={{ textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "var(--ink-soft)" : "inherit" }}>
                      {task.text}
                    </b>
                    <small><MiniIcon name="clock" /> {task.duration}</small>
                  </span>
                  <button
                    type="button"
                    className="plan-list-delete"
                    onClick={(e) => handleDeleteTask(task.id, e)}
                    title="Remove task"
                  >
                    ✕
                  </button>
                </label>
              ))}

              {/* Book reading suggestions */}
              {books.slice(0, 3).map((b) => (
                <label key={`book_${b.id}`}>
                  <input type="checkbox" />
                  <span>
                    <b>Continue reading: {b.title}</b>
                    <small><MiniIcon name="clock" /> ~30 min</small>
                  </span>
                  <em onClick={() => openBook(b)} style={{ cursor: "pointer" }}>Open</em>
                </label>
              ))}

              {customTasks.length === 0 && books.length === 0 && (
                <>
                  <label>
                    <input type="checkbox" />
                    <span><b>Upload your first textbook or notes</b><small><MiniIcon name="clock" /> 5 minutes</small></span>
                    <em onClick={goUpload} style={{ cursor: "pointer" }}>Start</em>
                  </label>
                  <label>
                    <input type="checkbox" />
                    <span><b>Take an adaptive concept challenge</b><small><MiniIcon name="clock" /> 15 minutes</small></span>
                    <em onClick={() => setActive("Tests")} style={{ cursor: "pointer" }}>Quiz</em>
                  </label>
                </>
              )}
            </div>
          </article>

          <article className="pending-card">
            <div className="card-title"><div><p className="kicker">Keep going</p><h3>Recent uploads</h3></div><button type="button" onClick={() => setActive("Library")}>View all</button></div>
            {books.slice(0, 2).map((b, i) => (
              <div className="pending-item" key={b.id}>
                <span className={`pending-art ${i === 0 ? "purple" : "blue"}`}><MiniIcon name="book" /></span>
                <div><b>{b.title}</b><small>{b.author}</small><i><span style={{ width: `${b.progress ?? 0}%` }} /></i></div>
              </div>
            ))}
            {books.length === 0 && <p style={{ color: "var(--ink-soft)", fontSize: ".8rem", padding: ".5rem 0" }}>No books yet. <button type="button" style={{ background: "none", border: "none", color: "var(--violet-deep)", fontWeight: 600, cursor: "pointer" }} onClick={goUpload}>Upload one now →</button></p>}
          </article>

          <article className="study-chart">
            <div className="card-title"><div><p className="kicker">Study analytics</p><h3>Hours of focused learning</h3></div><select defaultValue="This week"><option>This week</option><option>Last week</option><option>This month</option></select></div>
            <div className="chart-summary"><strong>18.5h</strong><span><b>+12%</b> from last week</span></div>
            <div className="line-chart" aria-label="Line chart showing study hours over seven days">
              <div className="y-labels"><span>6h</span><span>4h</span><span>2h</span><span>0h</span></div>
              <svg viewBox="0 0 700 190" preserveAspectRatio="none">
                <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7458f5" stopOpacity=".24" /><stop offset="100%" stopColor="#7458f5" stopOpacity="0" /></linearGradient></defs>
                <path className="chart-area" d="M0 155 C70 140,75 95,140 112 S225 150,280 85 S370 40,420 72 S510 135,560 82 S650 28,700 42 L700 190 L0 190Z" />
                <path className="chart-line" d="M0 155 C70 140,75 95,140 112 S225 150,280 85 S370 40,420 72 S510 135,560 82 S650 28,700 42" />
                {[["0", "155"], ["140", "112"], ["280", "85"], ["420", "72"], ["560", "82"], ["700", "42"]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="5" />)}
              </svg>
              <div className="x-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
            </div>
          </article>
        </section>}

        {/* ── Persistent Upload Workspace ── */}
        <div style={{ display: active === "Upload" ? "block" : "none", flex: 1, minHeight: 0, height: "calc(100% - 4.5rem)" }}>
          <UploadWorkspace
            book={selectedBook}
            books={books}
            onUploaded={loadBooks}
            onSelectBook={selectBookAndSave}
          />
        </div>

        {active === "Library" && (
          <LibraryView
            books={books}
            started={startedTests}
            openBook={openBook}
            startTest={startTest}
            onUploadClick={goUpload}
            onUploaded={loadBooks}
          />
        )}

        {active === "Tests" && (
          <TestView
            book={selectedBook ?? (books[0] ?? { id: 0, title: "Pick a book first", author: "", concepts: [] })}
            books={books}
            started={startedTests}
            completed={completedTests}
            onStarted={handleStartTest}
            onCompleted={handleCompleteTest}
            onSelectBook={selectBookAndSave}
            onDiscussInUpload={(targetBook, query) => {
              selectBookAndSave(targetBook);
              setActive("Upload");
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent("aarva_discuss_in_upload", {
                  detail: { book: targetBook, query }
                }));
              }, 120);
            }}
          />
        )}
        {active === "Settings" && <SettingsView name={name} email={userEmail} user={storedUser} />}
        {active === "Profile" && <ProfileView name={name} email={userEmail} bookCount={books.length} user={storedUser} />}
      </main>

      {/* Mobile backdrop overlay only on small screens when drawer is open */}
      {isMobile && !collapsed && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default function App() {
  // Restore auth state from localStorage on mount — keep as reactive state
  const [userName, setUserName] = useState<string>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("aarva_user") || "null");
      return stored?.name || "";
    } catch { return ""; }
  });

  const getInitialRoute = (): Route => {
    const hasToken = Boolean(localStorage.getItem("aarva_token"));
    const path = window.location.pathname;
    if (path === "/login") return "auth";
    if (path === "/dashboard" && hasToken) return "dashboard";
    if (path === "/dashboard") return "auth"; // force login if no token
    return "landing";
  };

  const [route, setRoute] = useState<Route>(getInitialRoute);

  const navigate = (next: Route) => {
    const path = next === "landing" ? "/" : `/${next === "auth" ? "login" : "dashboard"}`;
    window.history.pushState({}, "", path);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setRoute(next);
  };

  const handleLogout = () => {
    // Invalidate server session
    const token = localStorage.getItem("aarva_token");
    if (token) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => { });
    }
    localStorage.removeItem("aarva_token");
    localStorage.removeItem("aarva_user");
    localStorage.removeItem("aarva_active_book_id");
    localStorage.removeItem("aarva_language");
    localStorage.removeItem("aarva_language_v2");
    navigate("landing");
  };

  const handleLoginNav = () => {
    // Always read token fresh at click time — avoids stale closure bugs
    const hasToken = Boolean(localStorage.getItem("aarva_token"));
    navigate(hasToken ? "dashboard" : "auth");
  };

  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname;
      const tok = Boolean(localStorage.getItem("aarva_token"));
      if (path === "/dashboard" && !tok) { setRoute("auth"); return; }
      setRoute(path === "/login" ? "auth" : path === "/dashboard" ? "dashboard" : "landing");
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  if (route === "auth") return <AuthPage onHome={() => navigate("landing")} onComplete={(name) => { setUserName(name); navigate("dashboard"); }} />;
  if (route === "dashboard") {
    const activeUserKey = (() => {
      try {
        const u = JSON.parse(localStorage.getItem("aarva_user") || "null");
        return u?.id ? `user_${u.id}` : (u?.email || userName || "student");
      } catch {
        return userName || "student";
      }
    })();
    return <Dashboard key={activeUserKey} name={userName} onHome={handleLogout} />;
  }
  return <LandingPage onStart={() => navigate("auth")} onLogin={handleLoginNav} />;
}
