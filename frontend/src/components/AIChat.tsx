/**
 * AIChat — ChatGPT-style AI Tutor with:
 *  - Left sidebar: conversation history (grouped Today / Yesterday / Older)
 *  - Typewriter streaming for AI replies
 *  - Markdown rendering + syntax highlights via MessageRenderer
 *  - Per-message keyword highlights (from RAG sources)
 *  - Preview panel for source citations (expands on click)
 *  - Conversation persistence via localStorage
 *  - Voice STT input + TTS read-aloud
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Textbook } from '../types';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import {
  Send, User, Mic, MicOff, Volume2, Sparkles, BookOpen,
  ChevronRight, Plus, Trash2, MessageSquare, Search,
  ChevronLeft, ChevronDown, X, FileText, Hash,
} from 'lucide-react';
import { AIAvatar } from './AIAvatar';
import { MessageRenderer } from './MessageRenderer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Source {
  title: string;
  chapter: string;
  page: number;
}

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  sources?: Source[];
  followups?: string[];
  highlights?: string[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  textbookId: number;
  textbookTitle: string;
  preview: string; // last message preview
}

interface AIChatProps {
  activeTextbook: Textbook;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'aarva_chat_history';

function loadHistory(): Conversation[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(convs: Conversation[]) {
  // Keep latest 50 conversations
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs.slice(0, 50)));
}

function groupByDate(convs: Conversation[]): { label: string; items: Conversation[] }[] {
  const now = Date.now();
  const DAY = 86_400_000;
  const groups: { label: string; items: Conversation[] }[] = [
    { label: 'Today',      items: [] },
    { label: 'Yesterday',  items: [] },
    { label: 'Last 7 Days', items: [] },
    { label: 'Older',      items: [] },
  ];
  convs.forEach(c => {
    const age = now - c.createdAt;
    if (age < DAY)        groups[0].items.push(c);
    else if (age < 2*DAY) groups[1].items.push(c);
    else if (age < 7*DAY) groups[2].items.push(c);
    else                  groups[3].items.push(c);
  });
  return groups.filter(g => g.items.length > 0);
}

function makeTitle(firstUserMsg: string): string {
  const words = firstUserMsg.trim().split(/\s+/).slice(0, 7).join(' ');
  return words.length < firstUserMsg.trim().length ? `${words}…` : words;
}

function extractHighlights(text: string): string[] {
  // Pull bold text and all-caps acronyms as highlights
  const boldMatches  = [...text.matchAll(/\*\*([^*]{3,40})\*\*/g)].map(m => m[1]);
  const acronymMatch = [...text.matchAll(/\b([A-Z]{2,8})\b/g)].map(m => m[1]);
  return [...new Set([...boldMatches, ...acronymMatch])].slice(0, 10);
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const STREAM_CHUNK = 4; // chars per tick
const STREAM_MS    = 12; // ms per tick

// ─── Source Preview Panel ─────────────────────────────────────────────────────

const SourcePreview: React.FC<{ sources: Source[]; onClose: () => void }> = ({ sources, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 4, scale: 0.97 }}
    transition={{ duration: 0.18, ease: 'easeOut' as const }}
    style={{
      position: 'absolute',
      bottom: '100%',
      left: 0,
      marginBottom: 6,
      width: 280,
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 30,
      overflow: 'hidden',
    }}
  >
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.5rem 0.75rem',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'rgba(79,70,229,0.05)',
    }}>
      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Hybrid RAG Sources
      </span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
        <X size={14} />
      </button>
    </div>
    {sources.map((s, i) => (
      <div key={i} style={{
        padding: '0.6rem 0.75rem',
        borderBottom: i < sources.length - 1 ? '1px solid var(--border-subtle)' : 'none',
        display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
      }}>
        <FileText size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>{s.title}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {s.chapter} · Page {s.page}
          </div>
        </div>
        <div style={{
          marginLeft: 'auto', fontSize: '0.66rem', fontWeight: 700,
          color: 'var(--primary)', backgroundColor: 'var(--primary-light)',
          padding: '1px 6px', borderRadius: 'var(--radius-full)', flexShrink: 0,
        }}>
          p.{s.page}
        </div>
      </div>
    ))}
  </motion.div>
);

// ─── Conversation History Sidebar ─────────────────────────────────────────────

const HistorySidebar: React.FC<{
  conversations: Conversation[];
  activeId: string | null;
  searchQuery: string;
  onSearch: (q: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ conversations, activeId, searchQuery, onSearch, onSelect, onDelete, onNewChat, isOpen, onToggle }) => {
  const filtered = searchQuery.trim()
    ? conversations.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const grouped = groupByDate(filtered);

  return (
    <>
      {/* Collapsed toggle tab */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onToggle}
          title="Show chat history"
          style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
            zIndex: 20,
            width: 24, height: 56,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <ChevronRight size={14} />
        </motion.button>
      )}

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' as const }}
            style={{
              flexShrink: 0,
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl) 0 0 var(--radius-xl)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '0.85rem 0.75rem 0.6rem',
              borderBottom: '1px solid var(--border-subtle)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MessageSquare size={14} color="var(--primary)" /> Chat History
                </span>
                <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  <ChevronLeft size={16} />
                </button>
              </div>

              {/* New Chat button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onNewChat}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'transparent',
                  color: 'var(--primary)',
                  fontSize: '0.8rem', fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-light)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Plus size={14} /> New Chat
              </motion.button>

              {/* Search */}
              <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search history…"
                  value={searchQuery}
                  onChange={e => onSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '0.4rem 0.5rem 0.4rem 1.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-main)',
                    fontSize: '0.76rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Conversation list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem 0' }}>
              {grouped.length === 0 ? (
                <div style={{ padding: '1.5rem 0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  No conversations yet
                </div>
              ) : (
                grouped.map(group => (
                  <div key={group.label}>
                    <div style={{
                      padding: '0.5rem 0.75rem 0.25rem',
                      fontSize: '0.66rem', fontWeight: 800,
                      color: 'var(--text-subtle)',
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                    }}>
                      {group.label}
                    </div>
                    {group.items.map(conv => (
                      <div
                        key={conv.id}
                        style={{
                          position: 'relative',
                          padding: '0.5rem 0.75rem',
                          cursor: 'pointer',
                          backgroundColor: activeId === conv.id ? 'var(--primary-light)' : 'transparent',
                          borderRadius: 8,
                          margin: '1px 4px',
                          transition: 'background-color var(--transition-fast)',
                        }}
                        onClick={() => onSelect(conv.id)}
                        onMouseEnter={e => { if (activeId !== conv.id) e.currentTarget.style.backgroundColor = 'var(--bg-muted)'; }}
                        onMouseLeave={e => { if (activeId !== conv.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div style={{
                          fontSize: '0.78rem', fontWeight: activeId === conv.id ? 700 : 500,
                          color: activeId === conv.id ? 'var(--primary)' : 'var(--text-main)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          paddingRight: 20,
                        }}>
                          {conv.title}
                        </div>
                        <div style={{
                          fontSize: '0.68rem', color: 'var(--text-muted)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          marginTop: '0.1rem',
                        }}>
                          {conv.preview}
                        </div>
                        {/* Delete button */}
                        <button
                          onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
                          style={{
                            position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-subtle)', opacity: 0, transition: 'opacity 0.15s',
                            display: 'flex', padding: 2,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          className="conv-delete-btn"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Book badge */}
            <div style={{
              padding: '0.6rem 0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.7rem', color: 'var(--text-muted)',
            }}>
              <BookOpen size={12} color="var(--primary)" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conversations[0]?.textbookTitle || 'No textbook'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Main AIChat Component ────────────────────────────────────────────────────

export const AIChat: React.FC<AIChatProps> = ({ activeTextbook }) => {
  const { language, speakText, isSpeaking } = useTheme();

  // History
  const [conversations, setConversations] = useState<Conversation[]>(() => loadHistory());
  const [activeConvId, setActiveConvId]   = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [historySearch, setHistorySearch] = useState('');

  // Active messages (derived from activeConvId or a blank chat)
  const [messages, setMessages] = useState<Message[]>([]);

  // Streaming
  const [streamingId, setStreamingId]     = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // UI states
  const [inputText, setInputText]         = useState('');
  const [isTyping, setIsTyping]           = useState(false);
  const [justReplied, setJustReplied]     = useState(false);
  const [isListening, setIsListening]     = useState(false);
  const [openSourceId, setOpenSourceId]   = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Sync messages from active conversation ───────────────────────────────
  useEffect(() => {
    if (activeConvId) {
      const conv = conversations.find(c => c.id === activeConvId);
      setMessages(conv?.messages || []);
    } else {
      // New blank chat with welcome message
      setMessages([{
        id: 'welcome',
        sender: 'tutor',
        text: `Hello! I'm your **AARVA AI Tutor** powered by **Llama 3**.\n\nI've indexed **${activeTextbook.title}** using **Hybrid BM25 + Semantic Retrieval**. Ask me anything about definitions, algorithms, practice problems, or request a concept breakdown!`,
        timestamp: 'Just now',
        followups: [
          'Explain sliding window with a real-world analogy',
          'Compare TCP vs UDP in detail',
          'Give me a 3-question quiz',
        ],
        highlights: ['Llama 3', 'Hybrid BM25', 'Semantic Retrieval'],
      }]);
    }
  }, [activeConvId, activeTextbook.id]);

  // ── Scroll to bottom ─────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isTyping]);

  // ── Streaming typewriter ─────────────────────────────────────────────────
  const startStream = useCallback((fullText: string, msgId: string) => {
    if (streamRef.current) clearInterval(streamRef.current);
    let pos = 0;
    setStreamingId(msgId);
    setStreamingText('');
    streamRef.current = setInterval(() => {
      pos += STREAM_CHUNK;
      if (pos >= fullText.length) {
        setStreamingText(fullText);
        setStreamingId(null);
        if (streamRef.current) clearInterval(streamRef.current);
      } else {
        setStreamingText(fullText.slice(0, pos));
      }
    }, STREAM_MS);
  }, []);

  useEffect(() => () => { if (streamRef.current) clearInterval(streamRef.current); }, []);

  // ── Save conversation to history ─────────────────────────────────────────
  const persistConversation = useCallback((msgs: Message[], convId: string, title?: string) => {
    const lastMsg = msgs[msgs.length - 1];
    const convTitle = title || makeTitle(msgs.find(m => m.sender === 'user')?.text || activeTextbook.title);
    const updated: Conversation = {
      id: convId,
      title: convTitle,
      messages: msgs,
      createdAt: Date.now(),
      textbookId: activeTextbook.id,
      textbookTitle: activeTextbook.title,
      preview: lastMsg?.text?.slice(0, 60) || '',
    };
    setConversations(prev => {
      const others = prev.filter(c => c.id !== convId);
      const next = [updated, ...others];
      saveHistory(next);
      return next;
    });
  }, [activeTextbook]);

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = async (queryText?: string) => {
    const query = queryText || inputText;
    if (!query.trim() || isTyping) return;

    const convId = activeConvId || `conv_${Date.now()}`;
    if (!activeConvId) setActiveConvId(convId);

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: fmtTime(Date.now()),
    };

    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setInputText('');
    setIsTyping(true);

    try {
      const reply = await api.chatWithTutor(query, activeTextbook.id, language.label);

      setIsTyping(false);
      setJustReplied(true);
      setTimeout(() => setJustReplied(false), 700);

      const tutorMsgId = `t_${Date.now() + 1}`;
      const tutorMsg: Message = {
        id: tutorMsgId,
        sender: 'tutor',
        text: reply.response,
        timestamp: fmtTime(Date.now()),
        sources: reply.sources,
        followups: reply.suggested_followups,
        highlights: extractHighlights(reply.response),
      };

      const finalMsgs = [...nextMsgs, tutorMsg];
      setMessages(finalMsgs);
      persistConversation(finalMsgs, convId, activeConvId ? undefined : makeTitle(query));
      startStream(reply.response, tutorMsgId);

    } catch {
      setIsTyping(false);
    }
  };

  // ── Voice input ──────────────────────────────────────────────────────────
  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported.'); return; }
    if (isListening) { setIsListening(false); return; }
    try {
      const r = new SR();
      r.lang = language.code === 'hi' ? 'hi-IN' : 'en-US';
      r.interimResults = false;
      r.onstart  = () => setIsListening(true);
      r.onresult = (e: any) => { setInputText(e.results[0][0].transcript); setIsListening(false); };
      r.onerror  = () => setIsListening(false);
      r.onend    = () => setIsListening(false);
      r.start();
    } catch { setIsListening(false); }
  };

  // ── History actions ──────────────────────────────────────────────────────
  const handleNewChat = () => { setActiveConvId(null); setStreamingId(null); setStreamingText(''); };
  const handleSelectConv = (id: string) => { setActiveConvId(id); setStreamingId(null); };
  const handleDeleteConv = (id: string) => {
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id);
      saveHistory(next);
      return next;
    });
    if (activeConvId === id) handleNewChat();
  };

  // ── Avatar variant ───────────────────────────────────────────────────────
  const avatarVariant = justReplied ? 'success' : isTyping ? 'thinking' : isSpeaking ? 'speaking' : 'idle';

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-subtle)',
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        .conv-delete-btn { opacity: 0 !important; }
        [data-conv]:hover .conv-delete-btn { opacity: 1 !important; }
      `}</style>

      {/* ── History Sidebar ── */}
      <HistorySidebar
        conversations={conversations}
        activeId={activeConvId}
        searchQuery={historySearch}
        onSearch={setHistorySearch}
        onSelect={handleSelectConv}
        onDelete={handleDeleteConv}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
      />

      {/* ── Main Chat Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: '1.1rem 1.1rem 0.85rem' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: '0.8rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '0.8rem',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <AIAvatar variant={avatarVariant} size="sm" halo />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>AI Tutor Chat</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Llama 3 · Hybrid RAG · {activeTextbook.title.split(':')[0]}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <Sparkles size={12} color="var(--primary)" />
            <span>{language.label}</span>
            {conversations.length > 0 && (
              <span style={{
                marginLeft: 4,
                padding: '1px 7px', borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)', fontWeight: 700, fontSize: '0.68rem',
              }}>
                {conversations.length} saved
              </span>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.9rem', paddingRight: '0.25rem' }}>
          <AnimatePresence initial={false}>
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              const isStreaming = streamingId === msg.id;
              const displayText = isStreaming ? streamingText : msg.text;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    gap: '0.3rem',
                  }}
                >
                  <div style={{
                    display: 'flex', gap: '0.5rem',
                    maxWidth: '90%',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                  }}>
                    {/* Avatar */}
                    {isUser ? (
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', flexShrink: 0,
                      }}>
                        <User size={14} />
                      </div>
                    ) : (
                      <AIAvatar
                        variant={isStreaming ? 'thinking' : 'idle'}
                        size="xs"
                        style={{ flexShrink: 0 }}
                      />
                    )}

                    {/* Bubble */}
                    <div style={{
                      padding: '0.75rem 0.95rem',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      backgroundColor: isUser ? 'var(--primary)' : 'var(--bg-surface)',
                      color: isUser ? '#fff' : 'var(--text-main)',
                      border: isUser ? 'none' : '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-sm)',
                      position: 'relative',
                    }}>
                      <MessageRenderer
                        text={displayText}
                        highlights={isUser ? [] : (msg.highlights || [])}
                        streaming={isStreaming}
                        isUser={isUser}
                      />

                      {/* Timestamp + TTS */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                        gap: 6, marginTop: '0.35rem',
                      }}>
                        <span style={{ fontSize: '0.62rem', color: isUser ? 'rgba(255,255,255,0.6)' : 'var(--text-subtle)' }}>
                          {msg.timestamp}
                        </span>
                        {!isUser && (
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => speakText(msg.text)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', display: 'flex', padding: 0 }}
                          >
                            <Volume2 size={12} />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Source citation + preview */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginLeft: 34, position: 'relative' }}>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        onClick={() => setOpenSourceId(openSourceId === msg.id ? null : msg.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          fontSize: '0.7rem', color: 'var(--text-muted)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: '0.15rem 0.5rem',
                          backgroundColor: 'rgba(79,70,229,0.06)',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        <Hash size={10} color="var(--primary)" />
                        {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''} · Hybrid RAG
                        <ChevronDown size={10} style={{ transform: openSourceId === msg.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </motion.button>

                      <AnimatePresence>
                        {openSourceId === msg.id && (
                          <SourcePreview sources={msg.sources} onClose={() => setOpenSourceId(null)} />
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Follow-ups */}
                  {!isUser && msg.followups && !isStreaming && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      style={{ marginLeft: 34, display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}
                    >
                      {msg.followups.map((fp, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.03, backgroundColor: 'var(--primary-light)' }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSend(fp)}
                          style={{
                            padding: '0.28rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.2rem',
                          }}
                        >
                          {fp}
                          <ChevronRight size={11} />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Thinking indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }}
              >
                <AIAvatar variant="thinking" size="xs" halo />
                <div style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '16px 16px 16px 2px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Llama 3 is thinking</span>
                  {[0, 0.18, 0.36].map((d, i) => (
                    <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.55, repeat: Infinity, delay: d, ease: 'easeInOut' as const }}
                      style={{ display: 'block', width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{
          marginTop: '0.65rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: '0.45rem',
          flexShrink: 0,
        }}>
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={toggleVoice}
            style={{
              padding: '0.6rem', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: isListening ? 'var(--danger-bg)' : 'var(--bg-muted)',
              color: isListening ? 'var(--danger)' : 'var(--text-muted)',
              cursor: 'pointer', display: 'flex',
            }}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </motion.button>

          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={isListening ? 'Listening…' : 'Ask anything about this textbook…'}
              style={{
                width: '100%',
                padding: '0.6rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '0.86rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="gradient-brand-btn"
            style={{
              padding: '0.6rem', borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: inputText.trim() && !isTyping ? 'pointer' : 'default',
              opacity: inputText.trim() && !isTyping ? 1 : 0.5,
              flexShrink: 0,
            }}
          >
            <Send size={15} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
