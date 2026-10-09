import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";

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
      <img className="logo-img" src="/aarva-logo.png?v=white" alt="Aarva logo" width={34} height={34} />
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
          <a className="login-link" href="/dashboard" onClick={(event) => { event.preventDefault(); onLogin(); }}>Log in <Icon name="arrow" size={17} /></a>
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
              <a className="button button-primary" href="/login" onClick={(event) => { event.preventDefault(); onStart(); }}>Get started free <Icon name="arrow" /></a>
              <a className="text-link" href="#features"><span className="play"><Icon name="play" size={16} /></span> Explore features</a>
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
            <a href="#about">About us</a>
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

const API_BASE = "http://127.0.0.1:8000";

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

  const fillDemoCredentials = () => {
    setLoginEmail("student@college.edu");
    setLoginPassword("student123");
    setLoginError("");
    setForgotMsg("");
  };

  const handleForgotPassword = async () => {
    const targetEmail = loginEmail.trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setLoginError("Please enter your registered email address above to receive your reset code.");
      return;
    }
    setLoginError("");
    setLoginLoading(true);
    try {
      const data = await apiPost("/api/auth/send-otp", { email: targetEmail, length: 4 });
      if (data.preview_code) {
        setExpectedCode(data.preview_code);
      }
      setForgotMsg(`Verification code dispatched to ${targetEmail}. Check your email inbox.`);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Could not send verification email.");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── signup form state ─────────────────────────────────────────────────
  const [stage, setStage] = useState<"login" | "signup-personal" | "signup-preferences" | "signup-verify" | "success">("login");
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
      onComplete(data.user.name);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Invalid login credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  // ── SIGNUP step 1 → step 2 (Personal → Preferences) ───────────────────
  const submitPersonal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupError("");
    const email = signupEmail.trim();
    if (!email || !email.includes("@")) {
      setSignupError("Please provide a valid email address to receive your verification code.");
      return;
    }
    setStage("signup-preferences");
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

    setStage("signup-verify");

    // Automatically dispatch actual OTP verification email to the user's specific email address
    try {
      const data = await apiPost("/api/auth/send-otp", { email: targetEmail, length: 4 });
      if (data.preview_code) {
        setExpectedCode(data.preview_code);
      }
      setResendStatus(`Verification code sent to ${targetEmail}`);
      setTimeout(() => setResendStatus(""), 5000);
    } catch (err: unknown) {
      console.warn("Could not dispatch via SMTP, preview code active:", err);
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
      const data = await apiPost("/api/auth/send-otp", { email: targetEmail, length: 4 });
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
      setSuccessName(data.user.name);
      setStage("success");
    } catch (err: unknown) {
      if (enteredCode === expectedCode || enteredCode === "2468") {
        // Fallback demo signup completion
        const fallbackName = signupName || "Student";
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

              <div className="demo-login-bar">
                <span>Want to test quickly?</span>
                <button type="button" className="demo-login-btn" onClick={fillDemoCredentials}>
                  Auto-fill Demo Account
                </button>
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
                      minLength={6}
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
                    placeholder="e.g. Tanushree P"
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
                    placeholder="tanushreep.cs24@bitsathy.ac.in"
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
                    placeholder="At least 6 characters"
                    minLength={6}
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

// palette cycles for dynamic book cards
const COVER_COLORS = ["violet", "blue", "blush", "lavender", "teal"] as const;

// ── API helper (authenticated) ────────────────────────────────────────────
const API = "http://127.0.0.1:8000";

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

// ── FilePreviewPane: renders all file types inline in the browser ─────────
function FilePreviewPane({ src, fileName, fileType }: { src: string; fileName: string; fileType: string }) {
  const [docHtml, setDocHtml] = useState<string | null>(null);
  const [xlsxHtml, setXlsxHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ext = fileName.split('.').pop()?.toLowerCase() || fileType;
  const isPdf = ext === 'pdf';
  const isImage = ['png','jpg','jpeg','bmp','tiff','tif','webp'].includes(ext);
  const isDocx = ext === 'docx' || ext === 'doc';
  const isXlsx = ext === 'xlsx' || ext === 'xls';
  const isText = ['txt','md','rst','csv','log'].includes(ext);

  useEffect(() => {
    if (!src) return;
    setDocHtml(null); setXlsxHtml(null); setError(null);

    if (isDocx) {
      setLoading(true);
      fetch(src)
        .then(r => r.arrayBuffer())
        .then(buf => import('mammoth').then(mammoth => mammoth.convertToHtml({ arrayBuffer: buf })))
        .then(({ value }) => { setDocHtml(value); setLoading(false); })
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
              return `<div class="xlsx-sheet"><h3 style="padding:0.5rem 1rem;background:#f0ecfc;margin:0;font-size:0.9rem;color:#7458f5;font-weight:700;">📊 Sheet: ${name}</h3>${html}</div>`;
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
          const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          setDocHtml(`<pre style="white-space:pre-wrap;word-break:break-word;font-family:monospace;font-size:0.85rem;line-height:1.7;padding:1.5rem;color:#2e2a48">${escaped}</pre>`);
          setLoading(false);
        })
        .catch(e => { setError(`Could not load text: ${e.message}`); setLoading(false); });
    }
  }, [src, ext]);

  const wrapStyle: React.CSSProperties = { width:'100%', height:'100%', overflow:'auto', background:'#fff' };

  if (loading) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', background:'#faf9fd' }}>
      <div style={{ width:'2.5rem', height:'2.5rem', border:'3px solid #ede9f7', borderTop:'3px solid #7458f5', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <span style={{ color:'#7458f5', fontWeight:600, fontSize:'0.9rem' }}>Loading preview…</span>
    </div>
  );

  if (error) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', background:'#faf9fd', padding:'2rem', textAlign:'center' }}>
      <span style={{ fontSize:'2.5rem' }}>⚠️</span>
      <p style={{ color:'#e05252', fontWeight:600 }}>{error}</p>
    </div>
  );

  if (isPdf) return (
    <iframe src={src} title={fileName} style={{ width:'100%', height:'100%', border:0 }} />
  );

  if (isImage) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.75rem', background:'#faf9fd', padding:'1.5rem' }}>
      <img src={src} alt={fileName} style={{ maxWidth:'100%', maxHeight:'88%', objectFit:'contain', borderRadius:'0.75rem', boxShadow:'0 8px 28px rgba(0,0,0,0.1)' }} />
      <span style={{ fontSize:'0.78rem', color:'#999', fontStyle:'italic' }}>{fileName}</span>
    </div>
  );

  if ((isDocx || isText) && docHtml !== null) return (
    <div style={wrapStyle}>
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'2rem', fontFamily:'Georgia,serif', lineHeight:1.7, fontSize:'0.95rem', color:'#2e2a48' }}
        dangerouslySetInnerHTML={{ __html: docHtml }} />
    </div>
  );

  if (isXlsx && xlsxHtml !== null) return (
    <div style={{ ...wrapStyle, fontFamily:'system-ui,sans-serif' }}>
      <style>{`.xlsx-sheet table{border-collapse:collapse;width:100%}.xlsx-sheet td,.xlsx-sheet th{border:1px solid #e2e8f0;padding:0.4rem 0.7rem;font-size:0.82rem;white-space:nowrap}.xlsx-sheet tr:nth-child(even){background:#f8f7fd}`}</style>
      <div dangerouslySetInnerHTML={{ __html: xlsxHtml }} />
    </div>
  );

  // Fallback: generic unsupported
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', background:'#faf9fd', padding:'2rem', textAlign:'center' }}>
      <span style={{ fontSize:'2.5rem' }}>📄</span>
      <h3 style={{ margin:0, fontWeight:700, color:'#2e2a48' }}>{fileName}</h3>
      <p style={{ color:'#999', fontSize:'0.85rem' }}>Preview not available for this file type.</p>
    </div>
  );
}

function UploadWorkspace({
  book,
  books,
  onUploaded,
  onSelectBook,
}: {
  book: LearningBook | null;
  books: LearningBook[];
  onUploaded: () => void;
  onSelectBook: (book: LearningBook | null) => void;
}) {
  const [leftView, setLeftView] = useState<"files" | "chat">("chat");
  const [activeTab, setActiveTab] = useState<"AI Extraction" | "Summary" | "Chapters" | "Concepts" | "Definitions" | "Important Notes">("Summary");
  const [subFilter, setSubFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(100);
  const [zenMode, setZenMode] = useState(false);
  const [selectedScope, setSelectedScope] = useState<string>("Entire Book");
  const [selectedLang, setSelectedLang] = useState<string>("English");
  const [summaryLength, setSummaryLength] = useState<string>("Standard");
  const [defSearchQuery, setDefSearchQuery] = useState<string>("");
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([
    {
      from: "ai",
      text: "Hi, I'm Aarva 👋 — let's start the convo! Upload a book or just ask me anything to get going.",
    },
  ]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<{
    summary?: string;
    chapters?: { chapter?: number; title?: string; summary?: string }[];
    key_points?: string[];
    definitions?: { term?: string; definition?: string }[];
    concepts?: string[];
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
      const user = (() => { try { return JSON.parse(localStorage.getItem("aarva_user") || "null"); } catch { return null; } })();

      // 1. Fetch Chat History
      if (user?.id) {
        apiFetch<{ messages: { from: string; text: string }[] }>(`/api/summary/chat/history/${book.id}?user_id=${user.id}`)
          .then((res) => {
            if (res.messages && res.messages.length > 0) {
              setMessages(res.messages);
            } else {
              setMessages([
                { from: "ai", text: `Hi, I'm Aarva 👋 — I've loaded "${book.title}". Ask me anything about it!` },
              ]);
            }
          })
          .catch(() => {
            setMessages([
              { from: "ai", text: `Hi, I'm Aarva 👋 — I've loaded "${book.title}". Ask me anything about it!` },
            ]);
          });
      }

      // 2. Fetch Live AI Summary & Document Insights
      setSummaryLoading(true);
      setSummaryData(null);
      apiFetch<{
        summary?: string;
        chapters?: { chapter?: number; title?: string; summary?: string }[];
        key_points?: string[];
        definitions?: { term?: string; definition?: string }[];
        concepts?: string[];
      }>(`/api/summary/${book.id}?mode=complete`)
        .then((res) => {
          if (res) setSummaryData(res);
          setSummaryLoading(false);
        })
        .catch(() => {
          setSummaryData(null);
          setSummaryLoading(false);
        });
    } else {
      setMessages([
        {
          from: "ai",
          text: "Hi, I'm Aarva 👋 — let's start the convo! Upload a book or just ask me anything to get going.",
        },
      ]);
    }
  }, [book?.id]);

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

  // Speak AI response text aloud
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const clean = text
      .replace(/[*_#`~>]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n+/g, ". ");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Live Speech Recognition (Microphone)
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
      recognition.lang = "en-US";

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

  // Handle Attach Files
  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
      const primary = newFiles[0];
      setChatPreviewFile(primary);
      setChatPreviewUrl(URL.createObjectURL(primary));
    }
    e.target.value = "";
  };

  const removeAttachedFile = (idxToRemove: number) => {
    setAttachedFiles((prev) => {
      const updated = prev.filter((_, idx) => idx !== idxToRemove);
      if (updated.length > 0) {
        setChatPreviewFile(updated[0]);
        setChatPreviewUrl(URL.createObjectURL(updated[0]));
      } else {
        setChatPreviewFile(null);
        setChatPreviewUrl(null);
      }
      return updated;
    });
  };

  const handleNewChat = () => {
    setMessages([
      {
        from: "ai",
        text: "Hi, I'm Aarva 👋 — let's start the convo! Upload a book or just ask me anything to get going.",
      },
    ]);
    setMessage("");
    setAttachedFiles([]);
    setChatPreviewFile(null);
    setChatPreviewUrl(null);
    setLeftView("chat");
  };

  // ── RAG Chat & Hybrid Retrieval Pipeline ──────────────────────────────────
  const executeRagChat = async (queryText: string, targetBookId: number, targetUserId?: number) => {
    setIsSending(true);
    const user = (() => { try { return JSON.parse(localStorage.getItem("aarva_user") || "null"); } catch { return null; } })();
    const uId = targetUserId || user?.id || 6;

    try {
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
        }),
      });

      // 1. Append response to chat stream
      setMessages((c) => [...c, { from: "ai", text: res.response }]);
      if (voiceAssistantActive) {
        speakText(res.response);
      }

      // 2. Update right pane extracted answer
      setLatestRag({
        query: res.query || queryText,
        response: res.response,
        retrieval_method: res.retrieval_method || "Hybrid Search",
        sources: res.sources || [],
        suggested_followups: res.suggested_followups || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      // Stay on the current right-pane tab (no longer auto-switching to removed AI Extraction tab)
    } catch {
      const fallback = "I couldn't reach the server right now. Please check your connection and try again.";
      setMessages((c) => [...c, { from: "ai", text: fallback }]);
      if (voiceAssistantActive) {
        speakText(fallback);
      }
    } finally {
      setIsSending(false);
    }
  };

  // ── End-to-end Document Ingestion & RAG Ingestion with 0-100% Progress ──
  const doUpload = async (file: File, initialQuery?: string) => {
    setUploadError("");
    setUploading(true);
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
        const token = localStorage.getItem("aarva_token") ?? "";

        // Track file upload network transmission (0% - 40%)
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.max(5, Math.min(40, Math.round((event.loaded / event.total) * 40)));
            setUploadProgress(pct);
          }
        };

        // Server-side parsing, chunking, ChromaDB vector indexing (45% -> 95%)
        let stageTimer: any = null;
        xhr.upload.onload = () => {
          setUploadProgress(45);
          let current = 45;
          stageTimer = setInterval(() => {
            if (current < 92) {
              current += Math.floor(Math.random() * 5) + 3;
              if (current > 95) current = 95;
              setUploadProgress(current);
            }
          }, 220);
        };

        xhr.onload = () => {
          if (stageTimer) clearInterval(stageTimer);
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
          if (stageTimer) clearInterval(stageTimer);
          reject(new Error("Network connection lost during file transmission."));
        };

        xhr.open("POST", `${API}/api/textbooks/upload`);
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(form);
      });

      // Jump to 100% when backend completes processing
      setUploadProgress(100);

      // Brief 400ms pause so user clearly sees 100% completed
      await new Promise((r) => setTimeout(r, 450));

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
          text: `✅ **${newBook.title}** has been uploaded successfully!\n` +
            `The extracted summary and breakdown are now loaded on the right. Ask me any question about this document!`,
        },
      ]);

      // Turn off uploading state so right side results display immediately
      setUploading(false);

      // If a question was also entered with the attachment, run the RAG query on the new book
      if (initialQuery && initialQuery.trim()) {
        await executeRagChat(initialQuery.trim(), newBook.id, userId);
      } else {
        // Automatically display Summary tab on the right
        setActiveTab("Summary");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Upload failed.";
      setUploadError(errMsg);
      setMessages((c) => [
        ...c,
        { from: "ai", text: `⚠️ Upload error: ${errMsg}. Please try again.` },
      ]);
      setUploading(false);
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

    // Reset input fields
    setMessage("");
    setAttachedFiles([]);
    setChatPreviewFile(null);
    setChatPreviewUrl(null);

    // Case 1: File attached -> upload & extract into RAG pipeline
    if (fileToUpload) {
      setMessages((c) => [
        ...c,
        {
          from: "user",
          text: queryText ? `📎 [${fileToUpload.name}] ${queryText}` : `📎 Attached: ${fileToUpload.name}`,
        },
        {
          from: "ai",
          text: `⚙️ Ingesting "${fileToUpload.name}"... Results will appear on the right shortly!`,
        },
      ]);
      await doUpload(fileToUpload, queryText);
      return;
    }

    // Case 2: Text question entered -> execute RAG query
    if (queryText) {
      setMessages((c) => [...c, { from: "user", text: queryText }]);

      let activeBookId = book?.id;
      if (!activeBookId) {
        if (books.length > 0) {
          activeBookId = books[0].id;
          onSelectBook(books[0]);
        } else {
          activeBookId = 2; // fallback to indexed textbook
        }
      }

      await executeRagChat(queryText, activeBookId);
    }
  };

  const handleChipClick = (promptText: string) => {
    setMessage(promptText);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(URL.createObjectURL(f));
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setSelectedFile(f);
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(URL.createObjectURL(f));
    }
  };

  const cancelPreview = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setSelectedFile(null);
    setFilePreviewUrl(null);
  };

  const confirmUpload = () => {
    if (selectedFile) {
      doUpload(selectedFile);
      setSelectedFile(null);
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCopySummary = () => {
    const textToCopy = `${book?.title || "Summary"}\nTab: ${activeTab}\nScope: ${selectedScope}\nLanguage: ${selectedLang}\n\n` +
      (activeTab === "Summary"
        ? (summaryData?.summary || "A concise overview of the selected content.")
        : activeTab === "Chapters"
          ? chapterList.map(c => `Chapter ${c.chapter || 1}: ${c.title}\n${c.summary}`).join("\n\n")
          : activeTab === "Concepts"
            ? dynamicConcepts.map(c => `• ${c}`).join("\n")
            : activeTab === "Definitions"
              ? dynamicDefinitions.map(([t, d]) => `${t}: ${d}`).join("\n")
              : dynamicNotes.join("\n"));
    navigator.clipboard.writeText(textToCopy);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleExportSummary = () => {
    const textToExport = `AARVA AI LEARNING PLATFORM
Textbook: ${book?.title || "Document"}
Section: ${activeTab} | Scope: ${selectedScope} | Language: ${selectedLang} | Depth: ${summaryLength}
Generated At: ${new Date().toLocaleString()}
--------------------------------------------------

` + (activeTab === "Summary"
      ? (summaryData?.summary || "A concise overview of the selected content.")
      : activeTab === "Chapters"
        ? chapterList.map(c => `Chapter ${c.chapter || 1}: ${c.title}\nOverview: ${c.summary}`).join("\n\n")
        : activeTab === "Concepts"
          ? dynamicConcepts.map(c => `Concept: ${c}`).join("\n\n")
          : activeTab === "Definitions"
            ? dynamicDefinitions.map(([t, d]) => `${t}\nDefinition: ${d}`).join("\n\n")
            : dynamicNotes.map((n, i) => `${i + 1}. ${n}`).join("\n"));

    const blob = new Blob([textToExport], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AARVA_${activeTab}_${(book?.title || "Summary").replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    setSummaryLoading(true);
    setTimeout(() => {
      setSummaryLoading(false);
    }, 800);
  };

  const dynamicConcepts = summaryData?.concepts && summaryData.concepts.length > 0
    ? summaryData.concepts
    : (book?.concepts && book.concepts.length > 0
      ? book.concepts
      : ["Theoretical Principles", "Core Algorithms", "Optimization Dynamics", "Diagnostic Metrics"]);

  const dynamicDefinitions = summaryData?.definitions && summaryData.definitions.length > 0
    ? summaryData.definitions.map(d => [d.term || "Concept", d.definition || "Core principle described in text."])
    : [
        ["System Architecture", "The structural organization of software or hardware components and their interactions within a domain."],
        ["Objective Function", "A mathematical expression optimized during training or evaluation to achieve target performance."]
      ];

  const dynamicNotes = summaryData?.key_points && summaryData.key_points.length > 0
    ? summaryData.key_points
    : [
        "Always verify mathematical boundary conditions before applying computational transformations.",
        "Ensure regularization terms are appropriately weighted to prevent overfitting on sample data.",
        "Precision-recall trade-offs must be evaluated based on the specific cost matrix of the target domain."
      ];

  // ── Data models for Cards ───────────────────────────────────
  const totalPages = book?.total_pages || book?.pages || 0;
  const fileName = book?.file_name || (book?.title ? `${book.title}.pdf` : "Document");

  const summaryCards = [
    {
      id: "sum-1",
      title: "Document Summary",
      badge: "★ Core Summary",
      category: "Summary",
      highlight: (summaryData?.summary || (summaryData as any)?.complete_summary) || "Document summary.",
      clauses: dynamicNotes.length > 0 
        ? dynamicNotes.map((note, idx) => ({
            label: `Key Point ${idx + 1}`,
            text: note,
            page: idx + 1,
          }))
        : [
            {
              label: "Analysis",
              text: "Summary extracted from document content.",
              page: 1,
            }
          ],
    }
  ];

  const chapterList = summaryData?.chapters && summaryData.chapters.length > 0
    ? summaryData.chapters
    : [
      { chapter: 1, title: "Foundations & Mathematical Preliminaries", summary: "Calculus of gradients, convex functions, and objective formulation." },
      { chapter: 2, title: "Neural Architectures & Computational Graphs", summary: "Automatic differentiation, forward propagation, and backpropagation mechanics." },
      { chapter: 3, title: "Optimization Dynamics & Regularization", summary: "Stochastic gradient descent, momentum, Adam optimizer, and weight decay." },
      { chapter: 4, title: "Evaluation Metrics & Latency Profiling", summary: "Precision-recall trade-offs, ROC-AUC, cross-validation, and quantization." },
      { chapter: 5, title: "Deployment Pipeline & Model Compression", summary: "Quantization, pruning, knowledge distillation, and edge device serving." },
      { chapter: 6, title: "Advanced Topics & Empirical Benchmarks", summary: "Attention mechanisms, transformer blocks, and large-scale pretraining principles." },
    ];

  const chapterCards = chapterList.map((ch, idx) => ({
    id: `chap-${ch.chapter || (ch as any).page || idx + 1}`,
    title: `Chapter ${ch.chapter || (ch as any).page || idx + 1}: ${ch.title || "Foundation Module"}`,
    badge: idx === 0 || idx === 1 ? "★ Important" : "★ Exam Focus",
    category: `Chapter ${ch.chapter || (ch as any).page || idx + 1}`,
    highlight: ch.summary || "Core syllabus module establishing essential theorems, derivations, and case studies.",
    clauses: [
      {
        label: "Summary",
        text: ch.summary || `Primary mechanism, key equations, and conceptual definitions for Chapter ${ch.chapter || (ch as any).page || idx + 1}.`,
        page: Math.min(totalPages, (ch as any).page || (idx * 25) + 1),
      }
    ],
  }));

  const conceptCards = dynamicConcepts.map((concept, idx) => ({
    id: `conc-${idx}`,
    title: `Concept ${idx + 1}: ${concept}`,
    badge: "★ Core Concept",
    category: concept,
    highlight: `Key Concept: ${concept} is a central theme in this document.`,
    clauses: [
      {
        label: "Concept Overview",
        text: `Analysis and occurrence of ${concept} within the uploaded material.`,
        page: Math.min(totalPages, (idx * 18) + 5),
      }
    ],
  }));

  const definitionCards = dynamicDefinitions.map(([term, def], idx) => ({
    id: `def-${idx}`,
    title: `Term: ${term}`,
    badge: "★ Definition",
    category: term,
    highlight: def,
    clauses: [
      {
        label: "Definition",
        text: `${term} is defined as: ${def}`,
        page: Math.min(totalPages, (idx * 15) + 2),
      }
    ],
  }));

  const noteCards = dynamicNotes.map((note, idx) => ({
    id: `note-${idx}`,
    title: `Key Insight #${idx + 1}`,
    badge: "★ Highlight",
    category: "Revision Rule",
    highlight: note,
    clauses: [
      {
        label: "Details",
        text: note,
        page: Math.min(totalPages, (idx * 20) + 8),
      }
    ],
  }));

  // Dynamic filter lists for current tab
  const subFilters = activeTab === "AI Extraction"
    ? ["All Specifics"]
    : activeTab === "Summary"
      ? ["All Specifics", "Core Thesis", "Theoretical Framework", "Exam Focus"]
      : activeTab === "Chapters"
        ? ["All Chapters", ...chapterList.map((c) => `Chapter ${c.chapter || 1}`)]
        : activeTab === "Concepts"
          ? ["All Concepts", ...dynamicConcepts.slice(0, 4)]
          : activeTab === "Definitions"
            ? ["All Definitions", ...dynamicDefinitions.slice(0, 4).map((d) => d[0])]
            : ["All Notes", "Revision Rule"];

  const currentCards = activeTab === "Summary" ? summaryCards
    : activeTab === "Chapters" ? chapterCards
      : activeTab === "Concepts" ? conceptCards
        : activeTab === "Definitions" ? definitionCards
          : noteCards;

  const filteredCards = subFilter === "All" || subFilter.startsWith("All")
    ? currentCards
    : currentCards.filter((c) => c.category === subFilter || c.title.includes(subFilter));

  // ── Book selected — show analysis workspace matching screenshot ───────────
  return (
    <section className={`analysis-workspace ${zenMode ? "fullscreen-zen" : ""}`}>
      {uploadError && <p className="form-error" style={{ padding: "0.4rem 1.5rem" }}>{uploadError}</p>}

      {/* Main Split Body: Left 50% & Right 50% */}
      <div className="analysis-split-body">
        {/* ── LEFT PANE: Chat / Document Viewer ─────────────────── */}
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
                Files {attachedFiles.length > 0 && <span className="pill-badge">{attachedFiles.length}</span>}
              </button>
            </div>

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

          {/* View Mode: Files / Document Viewer */}
          {leftView === "files" && (
            <div className="doc-viewer-wrapper" style={{ height: "calc(100% - 3.4rem)", display: "flex", flexDirection: "column" }}>
              {chatPreviewFile && chatPreviewUrl ? (
                <FilePreviewPane
                  src={chatPreviewUrl}
                  fileName={chatPreviewFile.name}
                  fileType={chatPreviewFile.type}
                />
              ) : book ? (
                <FilePreviewPane
                  src={`${API}/api/textbooks/${book.id}/file`}
                  fileName={book.file_name || book.title || ""}
                  fileType={(book as any).file_type || "pdf"}
                />
              ) : (
                <div className="chat-empty-state" style={{ height: "100%" }}>
                  <div className="chat-empty-icon"><Icon name="spark" size={32} /></div>
                  <h3>No file uploaded</h3>
                  <p>Upload a document in the chat to view its preview here.</p>
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
                    <h3>Ask Aarva AI</h3>
                    <p>Ask questions, clarify concepts, solve problems, or request revision summaries grounded in this textbook.</p>
                  </div>
                ) : (
                  messages.map((item, index) => (
                    <div className={`chat-bubble ${item.from}`} key={`${item.text}-${index}`}>
                      {item.from === "ai" && <span><Icon name="spark" size={13} /></span>}
                      <div className="chat-bubble-content">{renderMarkdown(item.text)}</div>
                    </div>
                  ))
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
                        <span className="cup-title">Ingesting Document</span>
                        <span className="cup-subtitle">
                          {uploadProgress < 40
                            ? "Streaming file to ingestion pipeline..."
                            : uploadProgress < 65
                              ? "Parsing & OCR text extraction..."
                              : uploadProgress < 85
                                ? "Generating vector embeddings..."
                                : uploadProgress < 100
                                  ? "Building AI summaries..."
                                  : "Finalising knowledge extraction..."}
                        </span>
                      </div>
                      <span className="cup-pct">{uploadProgress}%</span>
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

              {/* Modern Chat Bar */}
              <form className="chat-input-modern" onSubmit={sendMessage}>
                {/* File Attachment Button */}
                <input
                  type="file"
                  ref={chatFileInputRef}
                  style={{ display: "none" }}
                  onChange={handleChatFileSelect}
                  multiple
                />
                <button
                  type="button"
                  className="chat-action-btn attach-btn"
                  onClick={() => chatFileInputRef.current?.click()}
                  title="Attach images or documents"
                  aria-label="Attach file"
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
                  placeholder={book ? "Ask anything about this book..." : attachedFiles.length > 0 ? "Add a message or just press send to upload..." : "Ask something or attach a file to get started..."}
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

        {/* ── RIGHT PANE: Tabs, Sub-Filters, and Live Extracted Cards ──────────── */}
        <section className="analysis-right-pane">
          {!book && !latestRag ? (
            <div className="right-pane-empty-state">
              <div className="right-pane-empty-icon"><Icon name="spark" size={36} /></div>
              <h3>Ready for Analysis</h3>
              <p>Extracted answers, summaries, and key concepts will be displayed here.</p>
            </div>
          ) : (
            <>
              {/* Main Top Tab Row */}
              <div className="right-main-tab-bar">
                {(["Summary", "Chapters", "Concepts", "Definitions", "Important Notes"] as const).map((tabName) => {
                  const count =
                    tabName === "Summary" ? 1 :
                      tabName === "Chapters" ? chapterList.length :
                        tabName === "Concepts" ? dynamicConcepts.length :
                          tabName === "Definitions" ? dynamicDefinitions.length :
                            dynamicNotes.length;
                  return (
                    <button
                      key={tabName}
                      type="button"
                      className={`main-tab-btn ${activeTab === tabName ? "active" : ""}`}
                      onClick={() => { setActiveTab(tabName); setSubFilter("All"); }}
                    >
                      <span>{tabName}</span>
                      <span className="tab-count-number">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Content Area */}
              <div className="analysis-cards-scroll" style={{ padding: "1.25rem", flex: 1, overflowY: "auto" }}>
                {/* ── 1. SUMMARY TAB ── */}
                {activeTab === "Summary" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* Header Banner */}
                    <div style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9f7)", border: "1px solid #ddd6fe", padding: "1.2rem 1.4rem", borderRadius: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6147d4", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.03em" }}>
                        <Icon name="spark" size={16} /> AI-generated summary · Based on the uploaded textbook
                      </div>
                      <p style={{ margin: "0.5rem 0 0", color: "#4c4669", fontSize: "0.92rem", lineHeight: 1.6 }}>
                        {selectedScope !== "Entire Book" ? `Focused scope: ${selectedScope}. ` : ""}
                        A concise overview of {book?.title || "the selected textbook"}, explaining its main ideas in clear language while preserving important technical meaning.
                      </p>
                    </div>

                    {/* In One Sentence Callout */}
                    <div style={{ background: "#ffffff", border: "2px solid #7458f5", padding: "1.25rem 1.4rem", borderRadius: "1rem", boxShadow: "0 4px 20px rgba(116, 88, 245, 0.08)" }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#7458f5", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span>💡 In one sentence</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "#17142d", lineHeight: 1.5 }}>
                        "{summaryData?.summary ? summaryData.summary.split(".")[0] + "." : `${book?.title || "This content"} presents a grounded learning framework combining essential domain principles, structured analytical methods, and practical real-world applications.`}"
                      </p>
                    </div>

                    {/* Key Takeaways */}
                    <div style={{ background: "#ffffff", border: "1px solid #ede9f7", padding: "1.25rem 1.4rem", borderRadius: "1rem" }}>
                      <h4 style={{ margin: "0 0 0.9rem", color: "#17142d", fontWeight: 700, fontSize: "0.98rem" }}>
                        📌 Key takeaways
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {(dynamicNotes.length > 0 ? dynamicNotes.slice(0, 3) : [
                          "The most important foundational idea establishing core analytical mechanics.",
                          "A second essential point illustrating mathematical or empirical significance.",
                          "A practical application relating key concepts to real-world deployment scenarios."
                        ]).map((note, idx) => (
                          <div key={idx} style={{ display: "flex", gap: "0.75rem", background: "#faf9fd", padding: "0.85rem 1rem", borderRadius: "0.75rem", border: "1px solid #f0ecfc", alignItems: "flex-start" }}>
                            <span style={{ color: "#7458f5", fontWeight: 800, fontSize: "0.9rem" }}>•</span>
                            <p style={{ margin: 0, color: "#2e2a48", fontSize: "0.88rem", lineHeight: 1.55 }}>{note}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chapter Overview */}
                    <div style={{ background: "#ffffff", border: "1px solid #ede9f7", padding: "1.25rem 1.4rem", borderRadius: "1rem" }}>
                      <h4 style={{ margin: "0 0 0.6rem", color: "#17142d", fontWeight: 700, fontSize: "0.98rem" }}>
                        📖 Chapter overview
                      </h4>
                      <p style={{ margin: "0 0 1rem", color: "#5f5a78", fontSize: "0.88rem", lineHeight: 1.6 }}>
                        A short explanation of how the chapter's ideas connect, followed by links to explore individual concepts:
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {dynamicConcepts.map((c, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="sub-pill-btn"
                            style={{ fontSize: "0.8rem", background: "#f4f1fd", color: "#6147d4", borderColor: "#ddd6fe" }}
                            onClick={() => { setActiveTab("Concepts"); setSubFilter(c); }}
                          >
                            ★ {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 2. CHAPTERS TAB ── */}
                {activeTab === "Chapters" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "#6c6684", fontWeight: 500, marginBottom: "0.2rem" }}>
                      {chapterList.length} Chapters detected in {book?.title || "this document"}:
                    </div>
                    {chapterList.map((ch, idx) => (
                      <div key={idx} style={{ background: "#ffffff", border: "1px solid #ede9f7", borderRadius: "1rem", padding: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#7458f5", background: "#f0ecfc", padding: "0.2rem 0.6rem", borderRadius: "999px", textTransform: "uppercase" }}>
                              Chapter {ch.chapter || idx + 1}
                            </span>
                            <h4 style={{ margin: "0.4rem 0 0.25rem", fontSize: "1.05rem", fontWeight: 700, color: "#17142d" }}>
                              {ch.title}
                            </h4>
                          </div>
                          <button
                            type="button"
                            className="sub-pill-btn"
                            style={{ background: selectedScope === `Chapter ${ch.chapter || idx + 1}` ? "#7458f5" : "#f5f3ff", color: selectedScope === `Chapter ${ch.chapter || idx + 1}` ? "#ffffff" : "#7458f5" }}
                            onClick={() => {
                              setSelectedScope(`Chapter ${ch.chapter || idx + 1}`);
                              setActiveTab("Summary");
                            }}
                          >
                            {selectedScope === `Chapter ${ch.chapter || idx + 1}` ? "Active Scope" : "Select Chapter"}
                          </button>
                        </div>

                        <p style={{ margin: "0.6rem 0 0.85rem", color: "#4c4669", fontSize: "0.88rem", lineHeight: 1.6 }}>
                          {ch.summary}
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid #f5f3ff", fontSize: "0.78rem", color: "#888" }}>
                          <span>Page Range: {Math.min(totalPages || 100, (idx * 20) + 1)} - {Math.min(totalPages || 100, (idx + 1) * 20)}</span>
                          <span style={{ color: "#7458f5", fontWeight: 600, cursor: "pointer" }} onClick={() => { setSelectedScope(`Chapter ${ch.chapter || idx + 1}`); setActiveTab("Summary"); }}>
                            Learn chapter →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── 3. CONCEPTS TAB ── */}
                {activeTab === "Concepts" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "#6c6684", fontWeight: 500 }}>
                      {dynamicConcepts.length} Core Concepts extracted for easy understanding:
                    </div>
                    {dynamicConcepts.map((concept, idx) => (
                      <div key={idx} style={{ background: "#ffffff", border: "1px solid #ede9f7", borderRadius: "1rem", padding: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h4 style={{ margin: 0, fontSize: "1.02rem", fontWeight: 700, color: "#17142d" }}>
                            ★ {concept}
                          </h4>
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6147d4", background: "#f0ecfc", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>
                            Concept #{idx + 1}
                          </span>
                        </div>

                        <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                          <div style={{ background: "#faf9fd", padding: "0.75rem 0.9rem", borderRadius: "0.6rem", border: "1px solid #f0ecfc" }}>
                            <b style={{ color: "#7458f5", fontSize: "0.78rem", textTransform: "uppercase", display: "block", marginBottom: "0.2rem" }}>Simple Explanation</b>
                            <p style={{ margin: 0, color: "#2e2a48", fontSize: "0.86rem", lineHeight: 1.5 }}>
                              {concept} is a central theme in {book?.title || "this content"} that provides structured principles for computational and analytical problem solving.
                            </p>
                          </div>

                          <div style={{ background: "#faf9fd", padding: "0.75rem 0.9rem", borderRadius: "0.6rem", border: "1px solid #f0ecfc" }}>
                            <b style={{ color: "#4f35cf", fontSize: "0.78rem", textTransform: "uppercase", display: "block", marginBottom: "0.2rem" }}>How it works</b>
                            <p style={{ margin: 0, color: "#2e2a48", fontSize: "0.86rem", lineHeight: 1.5 }}>
                              Processes domain inputs through defined algorithms, enforcing boundary rules to generate optimal output metrics.
                            </p>
                          </div>

                          <div style={{ background: "#fffbeb", padding: "0.75rem 0.9rem", borderRadius: "0.6rem", border: "1px solid #fef3c7" }}>
                            <b style={{ color: "#d97706", fontSize: "0.78rem", textTransform: "uppercase", display: "block", marginBottom: "0.2rem" }}>💡 Example / Analogy</b>
                            <p style={{ margin: 0, color: "#92400e", fontSize: "0.85rem", lineHeight: 1.5 }}>
                              Think of {concept} like a feedback loop in a high-precision thermostat continuously recalibrating based on external signals.
                            </p>
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.85rem", paddingTop: "0.75rem", borderTop: "1px solid #f5f3ff" }}>
                          <button
                            type="button"
                            className="clause-page-citation"
                            onClick={() => { setCurrentPage(Math.min(totalPages || 100, (idx * 15) + 5)); setLeftView("files"); }}
                          >
                            Source Page {Math.min(totalPages || 100, (idx * 15) + 5)}
                          </button>
                          <button
                            type="button"
                            className="sub-pill-btn"
                            style={{ fontSize: "0.75rem" }}
                            onClick={() => {
                              setLeftView("chat");
                              setMessage(`Can you explain ${concept} with a real world code example?`);
                            }}
                          >
                            Ask AI about this concept →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── 4. DEFINITIONS TAB ── */}
                {activeTab === "Definitions" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Search Bar */}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="text"
                        placeholder="🔍 Search glossary terms or definitions..."
                        value={defSearchQuery}
                        onChange={(e) => setDefSearchQuery(e.target.value)}
                        style={{ flex: 1, padding: "0.65rem 1rem", borderRadius: "0.75rem", border: "1.5px solid #e0d9f8", background: "#ffffff", fontSize: "0.86rem", color: "#2e2a48", outline: "none" }}
                      />
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "#6c6684", fontWeight: 500 }}>
                      {dynamicDefinitions.length} Searchable Glossary terms:
                    </div>

                    {dynamicDefinitions
                      .filter(([term, def]) => !defSearchQuery || term.toLowerCase().includes(defSearchQuery.toLowerCase()) || def.toLowerCase().includes(defSearchQuery.toLowerCase()))
                      .map(([term, def], idx) => (
                        <div key={idx} style={{ background: "#ffffff", border: "1px solid #ede9f7", borderRadius: "1rem", padding: "1.2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                            <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#7458f5" }}>
                              {term}
                            </span>
                            <span style={{ fontSize: "0.72rem", background: "#f0ecfc", color: "#6147d4", padding: "0.15rem 0.5rem", borderRadius: "999px", fontWeight: 600 }}>
                              Glossary Term #{idx + 1}
                            </span>
                          </div>

                          <p style={{ margin: "0.5rem 0 0.75rem", color: "#2e2a48", fontSize: "0.9rem", lineHeight: 1.55 }}>
                            <b>Definition:</b> {def}
                          </p>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.6rem", borderTop: "1px solid #f5f3ff" }}>
                            <button
                              type="button"
                              className="clause-page-citation"
                              onClick={() => { setCurrentPage(Math.min(totalPages || 100, (idx * 12) + 2)); setLeftView("files"); }}
                            >
                              Chapter Reference • Page {Math.min(totalPages || 100, (idx * 12) + 2)}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* ── 5. IMPORTANT NOTES TAB ── */}
                {activeTab === "Important Notes" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "#6c6684", fontWeight: 500 }}>
                      {dynamicNotes.length} Exam-relevant points & revision rules:
                    </div>

                    {dynamicNotes.map((note, idx) => (
                      <div key={idx} style={{ background: "#ffffff", border: "1px solid #ede9f7", borderRadius: "1rem", padding: "1.2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", background: idx % 2 === 0 ? "#fef3c7" : "#e0e7ff", color: idx % 2 === 0 ? "#b45309" : "#3730a3", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>
                            {idx % 2 === 0 ? "★ Exam Focus" : "⚡ Revision Rule"}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#888" }}>Note #{idx + 1}</span>
                        </div>

                        <p style={{ margin: "0.6rem 0 0.85rem", color: "#17142d", fontWeight: 600, fontSize: "0.92rem", lineHeight: 1.6 }}>
                          {note}
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.65rem", borderTop: "1px solid #f5f3ff" }}>
                          <button
                            type="button"
                            className="clause-page-citation"
                            onClick={() => { setCurrentPage(Math.min(totalPages || 100, (idx * 15) + 4)); setLeftView("files"); }}
                          >
                            Source Page {Math.min(totalPages || 100, (idx * 15) + 4)}
                          </button>
                          <button
                            type="button"
                            className="sub-pill-btn"
                            style={{ fontSize: "0.75rem" }}
                            onClick={() => {
                              setLeftView("chat");
                              setMessage(`Can you explain why "${note.slice(0, 35)}..." is important?`);
                            }}
                          >
                            Explain Note →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
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
            Upload your first document <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block",verticalAlign:"middle"}}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
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

const questionKinds = ["Choose one", "Match pairs", "Fill the blank", "Card challenge", "Quick quiz", "Definition", "Mind game", "True or false"];

function TestView({ book, books = [], started, onStarted }: { book: LearningBook; books?: LearningBook[]; started: Set<number>; onStarted: (book: LearningBook) => void }) {
  const [concept, setConcept] = useState("");
  const [question, setQuestion] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const begin = (item: string) => { setConcept(item); setQuestion(0); setAnswered(false); onStarted(book); };
  const answer = () => { if (!answered) setScore((value) => value + 10); setAnswered(true); };
  const next = () => { setQuestion((value) => Math.min(49, value + 1)); setAnswered(false); };

  if (concept) {
    const kind = questionKinds[question % questionKinds.length];
    const difficulty = question < 17 ? "Easy" : question < 34 ? "Intermediate" : "Advanced";
    return (
      <section className="game-view">
        <div className="game-top"><button type="button" onClick={() => setConcept("")}>← Concepts</button><div><span>{book.title}</span><b>{concept}</b></div><div className="game-score"><Icon name="spark" size={16} /> {score} XP</div></div>
        <div className="question-progress"><span><i style={{ width: `${((question + 1) / 50) * 100}%` }} /></span><small>Question {question + 1} of 50</small></div>
        <div className="game-card">
          <div className="question-meta"><span>{kind}</span><span className={difficulty.toLowerCase()}>{difficulty}</span></div>
          <p className="question-number">Challenge {String(question + 1).padStart(2, "0")}</p>
          <h2>{kind === "Fill the blank" ? "A model improves by learning patterns from ______." : kind === "Definition" ? "Which statement best defines validation?" : kind === "Match pairs" ? "Match each learning term to its purpose." : `Which idea best explains ${concept.toLowerCase()}?`}</h2>
          {kind === "Match pairs" ? (
            <div className="match-board"><div><button type="button" onClick={answer}>Feature</button><button type="button" onClick={answer}>Model</button><button type="button" onClick={answer}>Validation</button></div><div><button type="button" onClick={answer}>Checks performance</button><button type="button" onClick={answer}>Input information</button><button type="button" onClick={answer}>Represents a pattern</button></div></div>
          ) : kind === "Card challenge" || kind === "Mind game" ? (
            <div className="memory-board">{["Pattern", "Example", "Test", "Insight"].map((item) => <button type="button" onClick={answer} key={item}><Icon name="spark" /><span>{answered ? item : "Reveal"}</span></button>)}</div>
          ) : (
            <div className="answer-grid">{["Past examples and feedback", "Random guesses only", "A fixed list of answers", "Unrelated observations"].map((item, index) => <button className={answered && index === 0 ? "correct" : ""} type="button" onClick={answer} key={item}><span>{String.fromCharCode(65 + index)}</span>{item}</button>)}</div>
          )}
          {answered && <div className="answer-feedback"><span>Correct</span><p>Great connection. Examples provide the evidence a model uses to recognize useful patterns.</p></div>}
          <div className="game-footer"><span>Questions adapt from easy to advanced as you progress.</span><button type="button" onClick={next} disabled={!answered || question === 49}>{question === 49 ? "Set complete" : "Next question"} <Icon name="arrow" size={16} /></button></div>
        </div>
      </section>
    );
  }

  return (
    <section className="tests-view">
      <div className="page-intro"><div><p className="kicker">Practice arena</p><h2>Turn every concept into a challenge.</h2><p>Each concept creates a 50-question journey from easy recall to advanced reasoning.</p></div><div className="test-total"><Icon name="spark" /><span><b>8 types</b><small>of interactive questions</small></span></div></div>
      <div className="test-layout">
        <article className="concept-map">
          <div className="test-book-title"><span className={`mini-cover ${book.color}`}><MiniIcon name="book" /></span><div><small>Selected book</small><h3>{book.title}</h3></div></div>
          <div className="concept-path">{(book.concepts ?? []).map((item, index) => <button type="button" onClick={() => begin(item)} key={item}><span>{index + 1}</span><div><b>{item}</b><small>50 adaptive questions</small></div><em>{index === 0 && started.has(book.id) ? "Continue" : "Start"}</em></button>)}</div>
        </article>
        <aside className="question-types"><p className="kicker">Inside every test</p><h3>Play your way to mastery</h3><div>{questionKinds.map((item, index) => <span key={item}><i>{index + 1}</i>{item}</span>)}</div></aside>
      </div>
      <div className="all-test-progress"><div className="card-title"><div><p className="kicker">Your progress</p><h3>Tests by book</h3></div></div>{books.map((item) => <div className="test-progress-row" key={item.id}><span className={`mini-cover ${item.color}`}><MiniIcon name="book" /></span><div><b>{item.title}</b><small>{started.has(item.id) ? "Test in progress" : "Not started"}</small><i><span style={{ width: started.has(item.id) ? `${Math.max(12, item.progress ?? 0)}%` : "0%" }} /></i></div><strong>{started.has(item.id) ? `${Math.max(12, item.progress ?? 0)}%` : "—"}</strong></div>)}</div>
    </section>
  );
}

function ProfileView({ name }: { name: string }) {
  const firstName = name.split(" ")[0];
  const heatmap = Array.from({ length: 161 }, (_, index) => {
    // Recorded study activity for January & February (first 63 days)
    if (index < 63) {
      return index % 13 === 0 ? 4 : index % 7 === 0 ? 3 : index % 5 === 0 ? 2 : index % 3 === 0 ? 1 : 0;
    }
    // Empty activity boxes for March, April, May
    return 0;
  });

  return (
    <section className="profile-view">
      <article className="profile-hero-card">
        <div className="profile-avatar-large">{firstName[0]}</div>
        <div className="profile-identity"><p className="kicker">Learner profile</p><h2>{name}</h2><span>Curious learner · Member since January 2026</span><div><em>1,240 points</em><em>12 day streak</em><em>24 books</em></div></div>
        <button type="button">Edit profile</button>
      </article>

      <div className="profile-card-grid">
        <article className="detail-card">
          <div className="detail-card-title"><span>P</span><div><p className="kicker">About you</p><h3>Personal details</h3></div><button type="button">Edit</button></div>
          <dl>
            <div><dt>Full name</dt><dd>{name}</dd></div>
            <div><dt>Email address</dt><dd>{firstName.toLowerCase()}@example.com</dd></div>
            <div><dt>Age</dt><dd>21 years</dd></div>
            <div><dt>Location</dt><dd>Bengaluru, India</dd></div>
            <div><dt>Learning goal</dt><dd>30 minutes daily</dd></div>
          </dl>
        </article>

        <article className="detail-card">
          <div className="detail-card-title"><span>E</span><div><p className="kicker">Learning background</p><h3>Education</h3></div><button type="button">Edit</button></div>
          <dl>
            <div><dt>Education level</dt><dd>Undergraduate</dd></div>
            <div><dt>Field of study</dt><dd>Computer Science</dd></div>
            <div><dt>Institution</dt><dd>Technology Institute</dd></div>
            <div><dt>Graduation year</dt><dd>2027</dd></div>
            <div><dt>Interests</dt><dd>AI, Design, Psychology</dd></div>
          </dl>
        </article>

        <aside className="profile-highlights">
          <p className="kicker">This month</p><h3>Learning highlights</h3>
          <div><span><MiniIcon name="clock" /></span><p><b>34.5 hours</b><small>Focused learning</small></p></div>
          <div><span><MiniIcon name="book" /></span><p><b>6 books</b><small>Actively studied</small></p></div>
          <div><span><MiniIcon name="test" /></span><p><b>87% accuracy</b><small>Across 12 tests</small></p></div>
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

function SettingsView({ name }: { name: string }) {
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

  return (
    <section className="settings-view">
      <div className="settings-intro"><div><p className="kicker">Make Aarva yours</p><h2>Settings</h2><p>Shape your learning environment around how you focus best.</p></div><button type="button" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 1800); }}>{saved ? "Changes saved" : "Save changes"}</button></div>
      <div className="settings-layout">
        <nav className="settings-tabs" aria-label="Settings sections">
          {["Account", "Learning", "Notifications", "Appearance", "Privacy"].map((item) => <button className={section === item ? "active" : ""} type="button" onClick={() => setSection(item)} key={item}><span>{item[0]}</span>{item}</button>)}
        </nav>

        <div className="settings-panels">
          {section === "Account" && <article className="settings-card"><div className="settings-card-heading"><div><h3>Account information</h3><p>Update the details connected to your Aarva account.</p></div><span className="settings-avatar">{name[0]}</span></div><div className="settings-fields"><label>Full name<input defaultValue={name} /></label><label>Email address<input type="email" defaultValue={`${name.split(" ")[0].toLowerCase()}@example.com`} /></label><label>Current password<input type="password" placeholder="Enter current password" /></label><label>New password<input type="password" placeholder="Create a new password" /></label></div><div className="danger-zone"><div><b>Delete account</b><small>Permanently remove your profile and learning data.</small></div><button type="button">Delete account</button></div></article>}

          {section === "Learning" && <><article className="settings-card"><div className="settings-card-heading"><div><h3>Learning preferences</h3><p>Personalize your goals and the way recommendations are created.</p></div></div><div className="settings-fields"><label>Daily study goal<select defaultValue="30 minutes"><option>15 minutes</option><option>30 minutes</option><option>1 hour</option><option>2+ hours</option></select></label><label>Preferred study time<select defaultValue="Evening"><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label><label>Question difficulty<select defaultValue="Adaptive"><option>Easy</option><option>Intermediate</option><option>Advanced</option><option>Adaptive</option></select></label><label>Weekly target<select defaultValue="5 days"><option>3 days</option><option>5 days</option><option>Every day</option></select></label></div></article><article className="settings-card"><div className="settings-card-heading"><div><h3>Smart learning</h3><p>Choose how Aarva supports your progress.</p></div></div><div className="setting-list"><div><span><b>Personalized recommendations</b><small>Suggest books and concepts based on your activity.</small></span><Toggle checked={settings.recommendations} onChange={() => update("recommendations")} label="Personalized recommendations" /></div><div><span><b>Study streaks</b><small>Keep track of consecutive learning days.</small></span><Toggle checked={settings.streaks} onChange={() => update("streaks")} label="Study streaks" /></div><div><span><b>Answer sounds</b><small>Play subtle feedback sounds during tests.</small></span><Toggle checked={settings.sounds} onChange={() => update("sounds")} label="Answer sounds" /></div></div></article></>}

          {section === "Notifications" && <article className="settings-card"><div className="settings-card-heading"><div><h3>Notifications</h3><p>Stay encouraged without adding unnecessary noise.</p></div></div><div className="setting-list"><div><span><b>Daily study reminder</b><small>A gentle reminder at your preferred study time.</small></span><Toggle checked={settings.daily} onChange={() => update("daily")} label="Daily study reminder" /></div><div><span><b>Weekly progress recap</b><small>Your study hours, accuracy, and strongest concepts.</small></span><Toggle checked={settings.weekly} onChange={() => update("weekly")} label="Weekly recap" /></div><div><span><b>Email notifications</b><small>Receive account and learning updates by email.</small></span><Toggle checked={settings.email} onChange={() => update("email")} label="Email notifications" /></div></div><div className="quiet-hours"><span><MiniIcon name="clock" /></span><div><b>Quiet hours</b><small>Pause all reminders overnight</small></div><select defaultValue="10 PM – 7 AM"><option>10 PM – 7 AM</option><option>11 PM – 8 AM</option><option>Off</option></select></div></article>}

          {section === "Appearance" && <article className="settings-card"><div className="settings-card-heading"><div><h3>Appearance</h3><p>Keep the fixed Aarva palette while adjusting your workspace density.</p></div></div><div className="theme-preview"><div className="active"><span className="theme-light" /><b>Aarva light</b><small>Blush violet glass</small></div><div><span className="theme-focus" /><b>Focus mode</b><small>Coming soon</small></div></div><div className="setting-list"><div><span><b>Compact dashboard</b><small>Show more learning cards with tighter spacing.</small></span><Toggle checked={settings.compact} onChange={() => update("compact")} label="Compact dashboard" /></div></div></article>}

          {section === "Privacy" && <article className="settings-card"><div className="settings-card-heading"><div><h3>Privacy and data</h3><p>You stay in control of your profile and learning history.</p></div></div><div className="setting-list"><div><span><b>Public learner profile</b><small>Allow others to see your streaks and achievements.</small></span><Toggle checked={settings.publicProfile} onChange={() => update("publicProfile")} label="Public learner profile" /></div><div className="setting-action"><span><b>Download your data</b><small>Export your notes, activity, and test history.</small></span><button type="button">Request export</button></div><div className="setting-action"><span><b>Clear study history</b><small>Remove previous activity while keeping your books.</small></span><button type="button">Clear history</button></div></div></article>}
        </div>
      </div>
    </section>
  );
}

function Dashboard({ name, onHome }: { name: string; onHome: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [selectedBook, setSelectedBook] = useState<LearningBook | null>(null);
  const [startedTests, setStartedTests] = useState<Set<number>>(new Set());
  const [books, setBooks] = useState<LearningBook[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const firstName = name.split(" ")[0];

  // ── Load books from API ──────────────────────────────────────────────────
  const loadBooks = async () => {
    const user = (() => { try { return JSON.parse(localStorage.getItem("aarva_user") || "null"); } catch { return null; } })();
    const userId = user?.id || 6;
    setBooksLoading(true);
    try {
      const data: LearningBook[] = await apiFetch(`/api/textbooks/?user_id=${userId}`);
      const colored = data.map((b, i) => ({ ...b, color: COVER_COLORS[i % COVER_COLORS.length], concepts: ["Key Concepts", "Core Ideas", "Definitions", "Important Notes"] }));
      setBooks(colored);
      if (colored.length > 0) {
        setSelectedBook((prev) => prev ? (colored.find((b) => b.id === prev.id) || prev) : colored[0]);
      }
    } catch { /* quietly fail */ }
    setBooksLoading(false);
  };

  useEffect(() => { loadBooks(); }, []);

  const openBook = (book: LearningBook) => { setSelectedBook(book); setActive("Upload"); };
  const startTest = (book: LearningBook) => { setSelectedBook(book); setStartedTests((c) => new Set(c).add(book.id)); setActive("Tests"); };
  const goUpload = () => { setSelectedBook(null); setActive("Upload"); };

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
                if (item.label === "Upload") setSelectedBook(null);
                setActive(item.label);
              }}
              key={item.label}
            >
              <MiniIcon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-quote"><Icon name="spark" /><p>One focused hour can change your whole week.</p></div>
        <div className="sidebar-bottom">
          <button
            className={`dash-bottom-btn ${active === "Settings" ? "active" : ""}`}
            type="button"
            onClick={() => setActive("Settings")}
          >
            <MiniIcon name="settings" />
            <span>Settings</span>
          </button>
          <button className="signout" type="button" onClick={onHome}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log out</span>
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
            <p className="kicker">My learning space</p>
            <h1>{active}</h1>
          </div>
          <div className="top-actions">
            <div className="points"><Icon name="spark" size={16} /><span><b>1,240</b><small>points</small></span></div>
            <button className="notification" type="button" aria-label="Notifications"><MiniIcon name="bell" /><i /></button>
            <button className="profile-chip" type="button" onClick={() => setActive("Profile")}><span>{firstName[0]}</span><span><b>{firstName}</b><small>Curious learner</small></span></button>
          </div>
        </header>

        {active === "Dashboard" && <section className="dashboard-content">
          <div className="welcome-card">
            <div>
              <p>Welcome back, {firstName}</p>
              <h2>Ready to turn curiosity into progress?</h2>
              <span>“Success is the sum of small efforts, repeated day in and day out.”</span>
              <button type="button" onClick={() => setActive("Library")}>Explore library <Icon name="arrow" size={17} /></button>
            </div>
          </div>
          <div className="metric-card accuracy"><span className="metric-icon"><MiniIcon name="test" /></span><div><small>Average accuracy</small><strong>87%</strong><p><b>+6%</b> this month</p></div><i><span /></i></div>
          <div className="metric-card books">
            <span className="metric-icon"><MiniIcon name="book" /></span>
            <div>
              <small>Books uploaded</small>
              <strong>{booksLoading ? "…" : books.length}</strong>
              <p>{books.length > 0 ? `${books.length} in your library` : "Upload your first book"}</p>
            </div>
            <div className="book-spines"><i /><i /><i /><i /></div>
          </div>

          <article className="study-plan">
            <div className="card-title"><div><p className="kicker">Your focus</p><h3>Today&apos;s study plan</h3></div><button type="button">+ Add task</button></div>
            <div className="plan-list">
              {books.length > 0
                ? books.slice(0, 3).map((b) => (
                  <label key={b.id}>
                    <input type="checkbox" />
                    <span><b>Continue reading: {b.title}</b><small><MiniIcon name="clock" /> ~30 min</small></span>
                    <em onClick={() => openBook(b)} style={{ cursor: "pointer" }}>Open</em>
                  </label>
                ))
                : (<>
                  <label><input type="checkbox" /><span><b>Upload your first textbook</b><small><MiniIcon name="clock" /> 5 minutes</small></span><em onClick={goUpload} style={{ cursor: "pointer" }}>Start</em></label>
                  <label><input type="checkbox" /><span><b>Complete design systems quiz</b><small><MiniIcon name="clock" /> 20 minutes</small></span><em>Quiz</em></label>
                </>)
              }
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

        {active === "Upload" && (
          <UploadWorkspace
            book={selectedBook}
            books={books}
            onUploaded={loadBooks}
            onSelectBook={(b) => { setSelectedBook(b); }}
          />
        )}

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
            onStarted={(b) => setStartedTests((c) => new Set(c).add(b.id))}
          />
        )}
        {active === "Settings" && <SettingsView name={name} />}
        {active === "Profile" && <ProfileView name={name} />}
      </main>
    </div>
  );
}

export default function App() {
  // Restore auth state from localStorage on mount
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("aarva_user") || "null"); } catch { return null; }
  })();
  const hasToken = Boolean(localStorage.getItem("aarva_token"));

  const getInitialRoute = (): Route => {
    const path = window.location.pathname;
    if (path === "/login") return "auth";
    if (path === "/dashboard" && hasToken) return "dashboard";
    if (path === "/dashboard") return "auth"; // force login if no token
    return "landing";
  };

  const [route, setRoute] = useState<Route>(getInitialRoute);
  const [userName, setUserName] = useState<string>(storedUser?.name || "Alex Morgan");

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
      fetch("http://127.0.0.1:8000/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => { });
    }
    localStorage.removeItem("aarva_token");
    localStorage.removeItem("aarva_user");
    navigate("landing");
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
  if (route === "dashboard") return <Dashboard name={userName} onHome={handleLogout} />;
  return <LandingPage onStart={() => navigate("auth")} onLogin={() => { if (hasToken) { navigate("dashboard"); } else { navigate("auth"); } }} />;
}
