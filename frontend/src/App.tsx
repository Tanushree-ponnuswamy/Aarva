import { FormEvent, ReactNode, useEffect, useState } from "react";

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
    number: "01",
    eyebrow: "A calmer workflow",
    title: "Everything important, beautifully in focus.",
    copy: "Bring projects, decisions, and momentum into one clear space. Aarva removes the noise so your team can spend more time making progress.",
    visual: "dashboard",
  },
  {
    number: "02",
    eyebrow: "Made for momentum",
    title: "Collaborate in real time, without the friction.",
    copy: "Share thoughts, move work forward, and stay in sync with an experience that feels natural from the very first click.",
    visual: "collaboration",
  },
  {
    number: "03",
    eyebrow: "Meaningful insights",
    title: "Turn everyday activity into a smarter next move.",
    copy: "Simple, elegant reports reveal what is working and where to focus next—without a spreadsheet in sight.",
    visual: "insights",
  },
];

function Icon({
  name,
  size = 20,
}: {
  name: "arrow" | "play" | "spark" | "linkedin" | "mail" | "instagram" | "youtube";
  size?: number;
}) {
  const paths: Record<typeof name, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
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
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Logo() {
  return (
    <a className="logo" href="#home" aria-label="Aarva home">
      <span className="logo-mark"><Icon name="spark" size={17} /></span>
      <span>Aarva</span>
    </a>
  );
}

function FeatureVisual({ type }: { type: string }) {
  if (type === "collaboration") {
    return (
      <div className="visual-stage collaboration-card" aria-hidden="true">
        <span className="orbit orbit-one" />
        <span className="orbit orbit-two" />
        <div className="message message-one">
          <span className="avatar avatar-violet">M</span>
          <span><b>Maya</b><small>This direction feels just right.</small></span>
        </div>
        <div className="message message-two">
          <span className="avatar avatar-blue">N</span>
          <span><b>Noah</b><small>Ready to share with the team.</small></span>
        </div>
        <div className="presence">
          <span className="presence-dot" /> 8 people collaborating
        </div>
      </div>
    );
  }

  if (type === "insights") {
    return (
      <div className="visual-stage insight-card" aria-hidden="true">
        <div className="metric-top">
          <span>Weekly momentum</span>
          <small>Last 7 days</small>
        </div>
        <div className="big-number">+42%</div>
        <div className="chart">
          {[36, 52, 45, 68, 62, 84, 96].map((height, index) => (
            <span key={height} style={{ "--bar": `${height}%`, "--delay": `${index * 80}ms` } as React.CSSProperties} />
          ))}
        </div>
        <div className="chart-labels"><span>Mon</span><span>Sun</span></div>
      </div>
    );
  }

  return (
    <div className="visual-stage dashboard-card" aria-hidden="true">
      <div className="dash-head"><span /><span /><span /></div>
      <div className="dash-layout">
        <div className="dash-sidebar"><i /><i /><i /><i /></div>
        <div className="dash-main">
          <small>Good morning, Maya</small>
          <b>Make something wonderful.</b>
          <div className="progress-card"><span>Launch progress</span><strong>78%</strong><i /></div>
          <div className="mini-grid"><i /><i /><i /></div>
        </div>
      </div>
      <div className="floating-pill"><span>12</span> tasks done today</div>
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
            <div className="eyebrow reveal"><span />Thoughtfully built for modern teams</div>
            <h1 className="reveal reveal-delay">
              Make space for your <span className="gradient-text">brightest ideas.</span>
            </h1>
            <p className="hero-lede reveal reveal-delay-two">
              Create, connect, and move forward in one beautifully simple workspace designed to keep inspiration flowing.
            </p>
            <div className="hero-actions reveal reveal-delay-three">
              <a className="button button-primary" href="/login" onClick={(event) => { event.preventDefault(); onStart(); }}>Get started <Icon name="arrow" /></a>
              <a className="text-link" href="#about"><span className="play"><Icon name="play" size={16} /></span> See how it works</a>
            </div>
            <div className="trust-line reveal reveal-delay-three">
              <div className="avatar-stack"><span>A</span><span>N</span><span>S</span></div>
              <p><b>Loved by 2,000+ teams</b><br />who make meaningful things</p>
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
            <p className="kicker">Features</p>
            <h2>Less busywork.<br /><span className="gradient-text">More breakthrough.</span></h2>
            <p>Designed around how great teams actually think, create, and grow.</p>
          </div>
          <div className="feature-list">
            {features.map((feature, index) => (
              <article className={`feature-row ${index % 2 ? "reverse" : ""}`} key={feature.number}>
                <div className="feature-copy">
                  <span className="feature-number">{feature.number}</span>
                  <p className="feature-eyebrow">{feature.eyebrow}</p>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                  <a className="learn-link" href="#contact">Explore the feature <Icon name="arrow" size={18} /></a>
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
            <Logo />
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
type AuthStage = "login" | "personal" | "learning" | "verify" | "success";

const studyImage =
  "https://images.unsplash.com/photo-1763890965393-1cea435581ab?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200&h=1500";

function MiniIcon({ name }: { name: "dashboard" | "upload" | "library" | "test" | "settings" | "menu" | "bell" | "clock" | "book" }) {
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
  };
  return <svg className="mini-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function AuthPage({ onHome, onComplete }: { onHome: () => void; onComplete: (name: string) => void }) {
  const [stage, setStage] = useState<AuthStage>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStage("verify");
  };
  const submitPersonal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStage("learning");
  };
  const submitLearning = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStage("verify");
  };
  const verify = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code !== "2468") {
      setError("That code does not match. Use 2468 for this preview.");
      return;
    }
    setError("");
    setStage("success");
  };

  const step = stage === "personal" ? 1 : stage === "learning" ? 2 : stage === "verify" ? 3 : 0;

  return (
    <main className="auth-page">
      <button className="auth-back" onClick={onHome} type="button">← Back to home</button>
      <section className="auth-visual">
        <div className="auth-visual-copy">
          <Logo />
          <p className="kicker">Learn at your rhythm</p>
          <h1>Every lesson moves you <span>forward.</span></h1>
          <p>Build a learning space around your goals, your pace, and the ideas that excite you most.</p>
        </div>
        <img src={studyImage} alt="Student learning in a light-filled library" />
        <div className="auth-float-card"><span>12 day streak</span><small>Keep your curiosity going</small></div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-inner">
          {step > 0 && stage !== "success" && (
            <div className="auth-progress" aria-label={`Step ${step} of 3`}>
              {[1, 2, 3].map((item) => <span className={item <= step ? "active" : ""} key={item} />)}
              <small>Step {step} of 3</small>
            </div>
          )}

          {stage === "login" && (
            <>
              <p className="kicker">Welcome back</p>
              <h2>Continue your learning journey.</h2>
              <p className="auth-subtitle">Log in to pick up exactly where you left off.</p>
              <form className="auth-form" onSubmit={submitLogin}>
                <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" required /></label>
                <label>Password<input type="password" placeholder="Enter your password" minLength={6} required /></label>
                <div className="form-row"><label className="check-label"><input type="checkbox" /> Remember me</label><button className="text-button" type="button">Forgot password?</button></div>
                <button className="auth-primary" type="submit">Log in securely <Icon name="arrow" size={18} /></button>
              </form>
              <p className="auth-switch">New to Aarva? <button type="button" onClick={() => setStage("personal")}>Create an account</button></p>
            </>
          )}

          {stage === "personal" && (
            <>
              <p className="kicker">Tell us about you</p>
              <h2>Let&apos;s make Aarva yours.</h2>
              <p className="auth-subtitle">Start with a few personal details.</p>
              <form className="auth-form" onSubmit={submitPersonal}>
                <div className="avatar-upload"><span>{name ? name[0].toUpperCase() : "Y"}</span><div><b>Your profile photo</b><small>You can add one later</small></div><button type="button">Upload</button></div>
                <div className="input-grid">
                  <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required /></label>
                  <label>Age<input type="number" min="13" max="100" placeholder="Age" required /></label>
                </div>
                <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" required /></label>
                <label>Create password<input type="password" placeholder="At least 6 characters" minLength={6} required /></label>
                <button className="auth-primary" type="submit">Continue <Icon name="arrow" size={18} /></button>
              </form>
              <p className="auth-switch">Already have an account? <button type="button" onClick={() => setStage("login")}>Log in</button></p>
            </>
          )}

          {stage === "learning" && (
            <>
              <p className="kicker">Your learning profile</p>
              <h2>What would you love to learn?</h2>
              <p className="auth-subtitle">We&apos;ll shape recommendations around your answers.</p>
              <form className="auth-form" onSubmit={submitLearning}>
                <div className="input-grid">
                  <label>Education level<select required defaultValue=""><option value="" disabled>Select level</option><option>High school</option><option>Undergraduate</option><option>Postgraduate</option><option>Professional</option></select></label>
                  <label>Field of study<input placeholder="e.g. Computer science" required /></label>
                </div>
                <fieldset><legend>Learning interests</legend><div className="choice-grid">{["Technology", "Business", "Design", "Science", "Languages", "Personal growth"].map((item) => <label className="choice" key={item}><input type="checkbox" /><span>{item}</span></label>)}</div></fieldset>
                <fieldset><legend>App preferences</legend><div className="choice-grid">{["Daily reminders", "Weekly goals", "Study streaks", "Smart recommendations"].map((item) => <label className="choice" key={item}><input type="checkbox" /><span>{item}</span></label>)}</div></fieldset>
                <label>Daily study goal<select defaultValue="30 minutes"><option>15 minutes</option><option>30 minutes</option><option>1 hour</option><option>2+ hours</option></select></label>
                <button className="auth-primary" type="submit">Create my learning space <Icon name="arrow" size={18} /></button>
              </form>
            </>
          )}

          {stage === "verify" && (
            <div className="verify-view">
              <div className="verify-icon"><Icon name="mail" size={28} /></div>
              <p className="kicker">Check your inbox</p>
              <h2>Verify your email.</h2>
              <p className="auth-subtitle">We sent a four-digit code to <b>{email || "your email"}</b>. Enter it below to continue.</p>
              <form className="auth-form" onSubmit={verify}>
                <label>Verification code<input className="code-input" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="• • • •" required /></label>
                <small className="demo-code">Preview code: 2468</small>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="auth-primary" type="submit">Verify and continue <Icon name="arrow" size={18} /></button>
              </form>
              <button className="resend-button" type="button">Didn&apos;t receive it? Resend code</button>
            </div>
          )}

          {stage === "success" && (
            <div className="success-view">
              <div className="success-orbit"><Icon name="spark" size={34} /></div>
              <p className="kicker">You&apos;re all set</p>
              <h2>Your learning space is ready.</h2>
              <p>Welcome to Aarva{name ? `, ${name.split(" ")[0]}` : ""}. Small steps become remarkable progress—let&apos;s take the first one.</p>
              <button className="auth-primary" type="button" onClick={() => onComplete(name || "Alex")}>Open my dashboard <Icon name="arrow" /></button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const menuItems = [
  { label: "Dashboard", icon: "dashboard" as const },
  { label: "Upload", icon: "upload" as const },
  { label: "Library", icon: "library" as const },
  { label: "Tests", icon: "test" as const },
  { label: "Settings", icon: "settings" as const },
];

const learningBooks = [
  { id: 1, title: "Foundations of Machine Learning", author: "Dr. Elena Park", subject: "Technology", pages: 328, progress: 36, color: "violet", concepts: ["Neural Networks", "Supervised Learning", "Model Evaluation", "Feature Engineering"] },
  { id: 2, title: "The Science of Everyday Thinking", author: "M. Daniel Cooper", subject: "Psychology", pages: 246, progress: 62, color: "blue", concepts: ["Cognitive Bias", "Memory Systems", "Decision Making", "Critical Thinking"] },
  { id: 3, title: "Designing Human Experiences", author: "Aisha Raman", subject: "Design", pages: 194, progress: 18, color: "blush", concepts: ["User Research", "Information Architecture", "Prototyping", "Usability Testing"] },
];

type LearningBook = (typeof learningBooks)[number];

function UploadWorkspace({ book }: { book: LearningBook }) {
  const [tab, setTab] = useState("Summary");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { from: "ai", text: `I’ve analyzed “${book.title}”. Ask me to explain a concept, compare ideas, or find something by page.` },
  ]);
  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    const question = message;
    setMessages((current) => [...current, { from: "user", text: question }, { from: "ai", text: "Here’s the key idea: learning becomes reliable when you connect the concept to an example, test the connection, and revisit it over time." }]);
    setMessage("");
  };
  const notes: Record<string, ReactNode> = {
    Summary: <><h3>From information to understanding</h3><p>This book introduces a practical framework for learning complex ideas. It moves from first principles into real-world application, showing how patterns become useful models.</p><div className="summary-callout"><Icon name="spark" size={18} /><span><b>In one sentence</b>The strongest learning happens when theory, practice, and reflection work together.</span></div><h4>Chapter overview</h4><p>The opening chapters build essential vocabulary. Later sections connect those foundations to evaluation, iteration, and responsible application.</p></>,
    "Page wise": <div className="page-notes">{[["01–28", "Core ideas and essential vocabulary"], ["29–76", "How patterns are recognized"], ["77–142", "Building and testing a model"], ["143–214", "Common errors and improvements"]].map(([page, text]) => <div key={page}><span>{page}</span><p>{text}</p><button type="button">Open pages</button></div>)}</div>,
    "Concept wise": <div className="concept-notes">{book.concepts.map((concept, index) => <button type="button" key={concept}><span>0{index + 1}</span><b>{concept}</b><small>{index + 3} linked notes</small><Icon name="arrow" size={16} /></button>)}</div>,
    Definitions: <div className="definition-list">{[["Model", "A simplified representation used to understand or predict a system."], ["Feature", "A measurable property used as an input for learning."], ["Inference", "The process of reaching a conclusion from evidence."], ["Validation", "Checking performance on information not used during learning."]].map(([term, meaning]) => <div key={term}><b>{term}</b><p>{meaning}</p></div>)}</div>,
    "Important notes": <div className="important-notes">{["Understand the problem before selecting a method.", "Separate training examples from evaluation examples.", "High accuracy does not always mean a useful result.", "Review assumptions whenever the context changes."].map((note, index) => <label key={note}><span>{index + 1}</span><p>{note}</p><button type="button">Save</button></label>)}</div>,
  };

  return (
    <section className="upload-workspace">
      <div className="workspace-toolbar"><div><p className="kicker">Active book</p><h2>{book.title}</h2></div><label className="upload-new"><input type="file" accept=".pdf,.doc,.docx" />+ Upload another book</label></div>
      <div className="workspace-split">
        <article className="book-chat">
          <div className="panel-heading"><div className="ai-dot"><Icon name="spark" size={15} /></div><span><b>Chat with your book</b><small>Answers grounded in your upload</small></span></div>
          <div className="chat-messages">
            {messages.map((item, index) => <div className={`chat-bubble ${item.from}`} key={`${item.text}-${index}`}>{item.from === "ai" && <span><Icon name="spark" size={13} /></span>}<p>{item.text}</p></div>)}
          </div>
          <div className="prompt-chips"><button type="button" onClick={() => setMessage("Explain the hardest concept")}>Explain a concept</button><button type="button" onClick={() => setMessage("Give me a short revision plan")}>Revision plan</button></div>
          <form className="chat-input" onSubmit={sendMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask anything about this book…" /><button type="submit" aria-label="Send message"><Icon name="arrow" size={18} /></button></form>
        </article>
        <article className="book-insights">
          <div className="insight-tabs">{Object.keys(notes).map((item) => <button className={tab === item ? "active" : ""} type="button" onClick={() => setTab(item)} key={item}>{item}</button>)}</div>
          <div className="insight-content">{notes[tab]}</div>
        </article>
      </div>
    </section>
  );
}

function LibraryView({ started, openBook, startTest }: { started: Set<number>; openBook: (book: LearningBook) => void; startTest: (book: LearningBook) => void }) {
  return (
    <section className="library-view">
      <div className="page-intro"><div><p className="kicker">Your collection</p><h2>Books that are becoming knowledge.</h2><p>Open a book to continue the conversation, or turn any concept into a focused challenge.</p></div><label className="upload-new"><input type="file" accept=".pdf,.doc,.docx" />+ Upload book</label></div>
      <div className="library-grid">
        {learningBooks.map((book) => (
          <article className="library-card" key={book.id}>
            <button className={`book-cover ${book.color}`} type="button" onClick={() => openBook(book)}>
              <span className="cover-mark"><Icon name="spark" /></span><small>{book.subject}</small><b>{book.title}</b><em>{book.author}</em>
            </button>
            <div className="book-details"><div><small>{book.pages} pages</small>{started.has(book.id) && <span className="test-started">Test started</span>}</div><h3>{book.title}</h3><p>{book.author}</p><div className="book-progress"><span><i style={{ width: `${started.has(book.id) ? Math.max(book.progress, 12) : book.progress}%` }} /></span><small>{started.has(book.id) ? `${Math.max(book.progress, 12)}% test progress` : `${book.progress}% studied`}</small></div><div className="book-actions"><button type="button" onClick={() => openBook(book)}>Open chat</button><button type="button" onClick={() => startTest(book)}>Take test <Icon name="arrow" size={15} /></button></div></div>
          </article>
        ))}
      </div>
    </section>
  );
}

const questionKinds = ["Choose one", "Match pairs", "Fill the blank", "Card challenge", "Quick quiz", "Definition", "Mind game", "True or false"];

function TestView({ book, started, onStarted }: { book: LearningBook; started: Set<number>; onStarted: (book: LearningBook) => void }) {
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
          <div className="concept-path">{book.concepts.map((item, index) => <button type="button" onClick={() => begin(item)} key={item}><span>{index + 1}</span><div><b>{item}</b><small>50 adaptive questions</small></div><em>{index === 0 && started.has(book.id) ? "Continue" : "Start"}</em></button>)}</div>
        </article>
        <aside className="question-types"><p className="kicker">Inside every test</p><h3>Play your way to mastery</h3><div>{questionKinds.map((item, index) => <span key={item}><i>{index + 1}</i>{item}</span>)}</div></aside>
      </div>
      <div className="all-test-progress"><div className="card-title"><div><p className="kicker">Your progress</p><h3>Tests by book</h3></div></div>{learningBooks.map((item) => <div className="test-progress-row" key={item.id}><span className={`mini-cover ${item.color}`}><MiniIcon name="book" /></span><div><b>{item.title}</b><small>{started.has(item.id) ? "Test in progress" : "Not started"}</small><i><span style={{ width: started.has(item.id) ? `${Math.max(12, item.progress)}%` : "0%" }} /></i></div><strong>{started.has(item.id) ? `${Math.max(12, item.progress)}%` : "—"}</strong></div>)}</div>
    </section>
  );
}

function ProfileView({ name }: { name: string }) {
  const firstName = name.split(" ")[0];
  const heatmap = Array.from({ length: 140 }, (_, index) => {
    const value = index % 13 === 0 ? 4 : index % 7 === 0 ? 3 : index % 5 === 0 ? 2 : index % 3 === 0 ? 1 : 0;
    return value;
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
        <div className="heatmap-heading"><div><p className="kicker">Learning consistency</p><h3>Your study activity</h3><span>Hours spent learning over the past 20 weeks</span></div><div className="heatmap-total"><strong>126.5</strong><small>total hours</small></div></div>
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
  const [selectedBook, setSelectedBook] = useState<LearningBook>(learningBooks[0]);
  const [startedTests, setStartedTests] = useState<Set<number>>(new Set());
  const firstName = name.split(" ")[0];
  const openBook = (book: LearningBook) => { setSelectedBook(book); setActive("Upload"); };
  const startTest = (book: LearningBook) => { setSelectedBook(book); setStartedTests((current) => new Set(current).add(book.id)); setActive("Tests"); };

  return (
    <div className={`dashboard-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="dash-nav">
        <div className="dash-brand"><Logo /><button type="button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Open sidebar" : "Close sidebar"}><MiniIcon name="menu" /></button></div>
        <div className="dash-menu">
          {menuItems.map((item) => (
            <button className={active === item.label ? "active" : ""} type="button" onClick={() => setActive(item.label)} key={item.label}><MiniIcon name={item.icon} /><span>{item.label}</span></button>
          ))}
        </div>
        <div className="sidebar-quote"><Icon name="spark" /><p>One focused hour can change your whole week.</p></div>
        <button className="signout" type="button" onClick={onHome}><span>←</span><span>Sign out</span></button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-top">
          <button className="mobile-sidebar-toggle" type="button" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar"><MiniIcon name="menu" /></button>
          <div><p className="kicker">My learning space</p><h1>{active}</h1></div>
          <div className="top-actions">
            <div className="points"><Icon name="spark" size={16} /><span><b>1,240</b><small>points</small></span></div>
            <button className="notification" type="button" aria-label="Notifications"><MiniIcon name="bell" /><i /></button>
            <button className="profile-chip" type="button" onClick={() => setActive("Profile")}><span>{firstName[0]}</span><span><b>{firstName}</b><small>Curious learner</small></span></button>
          </div>
        </header>

        {active === "Dashboard" && <section className="dashboard-content">
          <div className="welcome-card">
            <div><p>Welcome back, {firstName}</p><h2>Ready to turn curiosity into progress?</h2><span>“Success is the sum of small efforts, repeated day in and day out.”</span><button type="button">Start studying <Icon name="arrow" size={17} /></button></div>
            <div className="welcome-orb"><MiniIcon name="book" /><span>Today is a good day to learn.</span></div>
          </div>
          <div className="metric-card accuracy"><span className="metric-icon"><MiniIcon name="test" /></span><div><small>Average accuracy</small><strong>87%</strong><p><b>+6%</b> this month</p></div><i><span /></i></div>
          <div className="metric-card books"><span className="metric-icon"><MiniIcon name="book" /></span><div><small>Books completed</small><strong>24</strong><p>3 in progress</p></div><div className="book-spines"><i /><i /><i /><i /></div></div>

          <article className="study-plan">
            <div className="card-title"><div><p className="kicker">Your focus</p><h3>Today&apos;s study plan</h3></div><button type="button">+ Add task</button></div>
            <div className="plan-list">
              <label><input type="checkbox" /><span><b>Read chapter 4: Neural Networks</b><small><MiniIcon name="clock" /> 40 minutes</small></span><em>Priority</em></label>
              <label><input type="checkbox" /><span><b>Complete design systems quiz</b><small><MiniIcon name="clock" /> 20 minutes</small></span><em>Quiz</em></label>
              <label><input type="checkbox" /><span><b>Review language flashcards</b><small><MiniIcon name="clock" /> 15 minutes</small></span><em>Review</em></label>
            </div>
          </article>

          <article className="pending-card">
            <div className="card-title"><div><p className="kicker">Keep going</p><h3>Pending study</h3></div><button type="button">View all</button></div>
            <div className="pending-item"><span className="pending-art purple"><MiniIcon name="book" /></span><div><b>UX Research</b><small>Course · 68% complete</small><i><span style={{ width: "68%" }} /></i></div></div>
            <div className="pending-item"><span className="pending-art blue"><MiniIcon name="test" /></span><div><b>Data Structures</b><small>Test · Due tomorrow</small><i><span style={{ width: "42%" }} /></i></div></div>
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
                {[["0","155"],["140","112"],["280","85"],["420","72"],["560","82"],["700","42"]].map(([cx,cy]) => <circle key={cx} cx={cx} cy={cy} r="5" />)}
              </svg>
              <div className="x-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
            </div>
          </article>
        </section>}
        {active === "Upload" && <UploadWorkspace book={selectedBook} />}
        {active === "Library" && <LibraryView started={startedTests} openBook={openBook} startTest={startTest} />}
        {active === "Tests" && <TestView book={selectedBook} started={startedTests} onStarted={(book) => setStartedTests((current) => new Set(current).add(book.id))} />}
        {active === "Settings" && <SettingsView name={name} />}
        {active === "Profile" && <ProfileView name={name} />}
      </main>
    </div>
  );
}

export default function App() {
  const initialRoute = window.location.pathname === "/login" ? "auth" : window.location.pathname === "/dashboard" ? "dashboard" : "landing";
  const [route, setRoute] = useState<Route>(initialRoute);
  const [userName, setUserName] = useState("Alex Morgan");

  const navigate = (next: Route) => {
    const path = next === "landing" ? "/" : `/${next === "auth" ? "login" : "dashboard"}`;
    window.history.pushState({}, "", path);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setRoute(next);
  };

  useEffect(() => {
    const syncRoute = () => setRoute(window.location.pathname === "/login" ? "auth" : window.location.pathname === "/dashboard" ? "dashboard" : "landing");
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  if (route === "auth") return <AuthPage onHome={() => navigate("landing")} onComplete={(name) => { setUserName(name); navigate("dashboard"); }} />;
  if (route === "dashboard") return <Dashboard name={userName} onHome={() => navigate("landing")} />;
  return <LandingPage onStart={() => navigate("auth")} onLogin={() => navigate("dashboard")} />;
}
