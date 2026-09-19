/**
 * MessageRenderer — ChatGPT-style markdown renderer for AARVA AI Tutor.
 *
 * Renders:
 *   **bold**  *italic*  `inline code`
 *   ```lang\ncode block\n```
 *   # h1  ## h2  ### h3
 *   - / * bullet lists   1. numbered lists
 *   > blockquotes
 *   Highlighted keywords (via `highlights` prop)
 *   Streaming cursor (via `streaming` prop)
 */
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MessageRendererProps {
  text: string;
  /** Extra keywords to highlight in yellow */
  highlights?: string[];
  /** Show blinking cursor at end (streaming mode) */
  streaming?: boolean;
  isUser?: boolean;
}

// ── Keyword highlight helper ───────────────────────────────────────────────────
function applyHighlights(text: string, highlights: string[]): React.ReactNode {
  if (!highlights.length) return text;
  const pattern = new RegExp(`(${highlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    pattern.test(part) ? (
      <mark key={i} style={{ backgroundColor: 'rgba(251,191,36,0.35)', borderRadius: 3, padding: '0 2px', color: 'inherit' }}>
        {part}
      </mark>
    ) : part
  );
}

// ── Inline markdown parser ────────────────────────────────────────────────────
function parseInline(text: string, highlights: string[] = []): React.ReactNode {
  // Process: bold, italic, inline code
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**')) {
      return <strong key={i}>{applyHighlights(tok.slice(2, -2), highlights)}</strong>;
    }
    if (tok.startsWith('*') && tok.endsWith('*') && tok.length > 2) {
      return <em key={i}>{tok.slice(1, -1)}</em>;
    }
    if (tok.startsWith('`') && tok.endsWith('`') && tok.length > 2) {
      return (
        <code key={i} style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '0.82em',
          backgroundColor: 'rgba(99,102,241,0.12)',
          color: 'var(--primary)',
          padding: '0.15em 0.4em',
          borderRadius: 4,
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          {tok.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={i}>{applyHighlights(tok, highlights)}</React.Fragment>;
  });
}

// ── Code Block with copy button ───────────────────────────────────────────────
const CodeBlock: React.FC<{ lang: string; code: string }> = ({ lang, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple token coloriser — handles common programming keywords
  const colorise = (src: string): React.ReactNode[] => {
    const KEYWORDS = /\b(def|class|return|import|from|if|else|elif|for|while|in|not|and|or|True|False|None|const|let|var|function|async|await|export|default|interface|type|extends|implements|public|private|static|new|this|try|catch|throw|finally|with|as|pass|break|continue|yield|lambda|self|super|null|undefined|typeof|instanceof)\b/g;
    const STRINGS  = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;
    const NUMBERS  = /\b(\d+\.?\d*)\b/g;
    const COMMENTS = /(#.+|\/\/.+|\/\*[\s\S]*?\*\/)/g;

    // Tokenise line-by-line for stability
    return src.split('\n').map((line, li) => {
      // Very simple: apply colour classes without full AST
      const segments: React.ReactNode[] = [];
      let remaining = line;
      let key = 0;

      // Comments
      const cMatch = remaining.match(/^(\s*)(#.+|\/\/.+)$/);
      if (cMatch) {
        segments.push(<span key={key++} style={{ color: '#6b7280', fontStyle: 'italic' }}>{remaining}</span>);
        segments.push(<br key={`br-${li}`} />);
        return segments;
      }

      // Basic token split
      const parts = remaining.split(/(\b(?:def|class|return|import|from|if|else|elif|for|while|in|not|and|or|True|False|None|const|let|var|function|async|await|export|default|interface|type|new|this|try|catch|throw|null|undefined|typeof)\b|["'`](?:[^"'`\\]|\\.)*["'`]|\b\d+\.?\d*\b)/g);
      parts.forEach((part, pi) => {
        if (/^(def|class|return|import|from|if|else|elif|for|while|in|not|and|or|True|False|None|const|let|var|function|async|await|export|default|interface|type|new|this|try|catch|throw|null|undefined|typeof)$/.test(part)) {
          segments.push(<span key={`${li}-${pi}`} style={{ color: '#818cf8', fontWeight: 600 }}>{part}</span>);
        } else if (/^["'`]/.test(part)) {
          segments.push(<span key={`${li}-${pi}`} style={{ color: '#86efac' }}>{part}</span>);
        } else if (/^\d/.test(part)) {
          segments.push(<span key={`${li}-${pi}`} style={{ color: '#fb923c' }}>{part}</span>);
        } else {
          segments.push(<span key={`${li}-${pi}`}>{part}</span>);
        }
      });
      segments.push(<br key={`br-${li}`} />);
      return segments;
    });
  };

  return (
    <div style={{
      borderRadius: 10,
      overflow: 'hidden',
      border: '1px solid rgba(99,102,241,0.2)',
      marginTop: '0.6rem',
      marginBottom: '0.6rem',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.4rem 0.8rem',
        backgroundColor: 'rgba(15,17,23,0.95)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
      }}>
        <span style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: 'monospace', fontWeight: 600 }}>
          {lang || 'code'}
        </span>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none',
            color: copied ? '#4ade80' : '#9ca3af',
            cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
            padding: '2px 6px', borderRadius: 4,
            transition: 'color 0.2s',
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {/* Code body */}
      <pre style={{
        margin: 0,
        padding: '0.9rem 1rem',
        backgroundColor: 'rgba(10,10,15,0.97)',
        color: '#e2e8f0',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '0.82rem',
        lineHeight: 1.6,
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {colorise(code)}
      </pre>
    </div>
  );
};

// ── Block parser ──────────────────────────────────────────────────────────────
function parseBlocks(text: string, highlights: string[] = []): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Fenced code block ─────────────────────────────
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(<CodeBlock key={i} lang={lang} code={codeLines.join('\n')} />);
      i++;
      continue;
    }

    // ── Heading ───────────────────────────────────────
    const hMatch = line.match(/^(#{1,3})\s+(.*)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const content = hMatch[2];
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
      const sizes = { 1: '1.15rem', 2: '1.05rem', 3: '0.96rem' };
      nodes.push(
        <Tag key={i} style={{
          fontFamily: 'var(--font-heading)',
          fontSize: sizes[level as 1|2|3],
          fontWeight: 800,
          marginTop: '0.9rem',
          marginBottom: '0.3rem',
          color: 'var(--text-main)',
        }}>
          {parseInline(content, highlights)}
        </Tag>
      );
      i++;
      continue;
    }

    // ── Blockquote ────────────────────────────────────
    if (/^>\s/.test(line)) {
      const bqLines: string[] = [];
      while (i < lines.length && /^>\s/.test(lines[i])) {
        bqLines.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <blockquote key={i} style={{
          borderLeft: '3px solid var(--primary)',
          paddingLeft: '0.85rem',
          margin: '0.5rem 0',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          fontSize: '0.9em',
        }}>
          {bqLines.map((l, li) => <p key={li} style={{ margin: '0.15rem 0' }}>{parseInline(l, highlights)}</p>)}
        </blockquote>
      );
      continue;
    }

    // ── Bullet list ───────────────────────────────────
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={i} style={{ paddingLeft: '1.3rem', margin: '0.4rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {items.map((item, ii) => (
            <li key={ii} style={{ fontSize: '0.9em', lineHeight: 1.55 }}>
              {parseInline(item, highlights)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Numbered list ─────────────────────────────────
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      nodes.push(
        <ol key={i} style={{ paddingLeft: '1.5rem', margin: '0.4rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {items.map((item, ii) => (
            <li key={ii} style={{ fontSize: '0.9em', lineHeight: 1.55 }}>
              {parseInline(item, highlights)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Horizontal rule ───────────────────────────────
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0.75rem 0' }} />);
      i++;
      continue;
    }

    // ── Empty line → paragraph break ─────────────────
    if (!line.trim()) {
      i++;
      continue;
    }

    // ── Normal paragraph ──────────────────────────────
    nodes.push(
      <p key={i} style={{ margin: '0.15rem 0', lineHeight: 1.65, fontSize: '0.9em' }}>
        {parseInline(line, highlights)}
      </p>
    );
    i++;
  }

  return nodes;
}

// ── Streaming cursor ──────────────────────────────────────────────────────────
const StreamingCursor: React.FC = () => (
  <span
    style={{
      display: 'inline-block',
      width: 2,
      height: '1em',
      backgroundColor: 'var(--primary)',
      marginLeft: 2,
      verticalAlign: 'text-bottom',
      animation: 'cursorBlink 0.7s step-end infinite',
    }}
  />
);

// ── Main export ───────────────────────────────────────────────────────────────
export const MessageRenderer: React.FC<MessageRendererProps> = ({
  text,
  highlights = [],
  streaming = false,
  isUser = false,
}) => {
  return (
    <div
      style={{
        fontFamily: isUser ? 'var(--font-sans)' : 'var(--font-sans)',
        fontSize: '0.9rem',
        color: isUser ? '#ffffff' : 'var(--text-main)',
        lineHeight: 1.65,
      }}
    >
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
      {isUser ? (
        <p style={{ margin: 0, lineHeight: 1.6 }}>{text}</p>
      ) : (
        <>
          {parseBlocks(text, highlights)}
          {streaming && <StreamingCursor />}
        </>
      )}
    </div>
  );
};
