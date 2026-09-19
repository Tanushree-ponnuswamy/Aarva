import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SummaryData, Textbook } from '../types';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import {
  Layers, BookmarkCheck, FileDown, Copy, Check,
  ChevronDown, ChevronUp, Volume2
} from 'lucide-react';
import { AIAvatar } from './AIAvatar';

interface SummarizerViewProps {
  activeTextbook: Textbook;
}

export const SummarizerView: React.FC<SummarizerViewProps> = ({ activeTextbook }) => {
  const { speakText } = useTheme();

  const [mode, setMode] = useState<'complete' | 'chapter' | 'page' | 'concept'>('complete');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedConcept, setSelectedConcept] = useState<string>('Sliding Window Protocol');
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'key_points' | 'definitions' | null>('key_points');

  useEffect(() => {
    loadSummary();
  }, [activeTextbook.id, mode, selectedChapter, selectedConcept]);

  const loadSummary = async () => {
    setLoading(true);
    const data = await api.getSummary(activeTextbook.id, mode, selectedChapter, selectedConcept);
    setSummaryData(data);
    setLoading(false);
  };

  const handleCopy = () => {
    if (!summaryData) return;
    const textToCopy = `AARVA AI Textbook Summary: ${summaryData.title}\nMode: ${summaryData.mode.toUpperCase()}\n\n${summaryData.summary}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-subtle)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Animated Llama avatar — thinking while loading, idle otherwise */}
          <AIAvatar variant={loading ? 'thinking' : 'idle'} size="sm" halo />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              {activeTextbook.title}
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              AI Summarizer · Llama 3 · Hybrid RAG
            </div>
          </div>
        </div>

        {/* Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => summaryData && speakText(summaryData.summary)}
            title="Read Summary Aloud (Voice)"
            style={{
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <Volume2 size={14} /> Listen
          </button>

          <button
            onClick={handleCopy}
            style={{
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: '0.45rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <FileDown size={14} /> Export
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.4rem',
          backgroundColor: 'var(--bg-muted)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem'
        }}
      >
        {[
          { id: 'complete', label: 'Complete Book' },
          { id: 'chapter', label: 'Chapter-wise' },
          { id: 'page', label: 'Page-wise' },
          { id: 'concept', label: 'Concept-wise' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as any)}
            style={{
              padding: '0.5rem 0.3rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: mode === tab.id ? 'var(--bg-surface)' : 'transparent',
              color: mode === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: mode === tab.id ? 700 : 500,
              cursor: 'pointer',
              boxShadow: mode === tab.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-Filters for Chapter or Concept Mode */}
      {mode === 'chapter' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Select Chapter:</span>
          <select
            value={selectedChapter}
            onChange={e => setSelectedChapter(Number(e.target.value))}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '0.8rem'
            }}
          >
            <option value={1}>Chapter 1: Foundation & Layered Architecture</option>
            <option value={2}>Chapter 2: Direct Link Networks & Framing</option>
            <option value={3}>Chapter 3: Packet Switching & Bridging</option>
            <option value={4}>Chapter 4: Internetworking (IP & Routing)</option>
          </select>
        </div>
      )}

      {mode === 'concept' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Select Concept:</span>
          <select
            value={selectedConcept}
            onChange={e => setSelectedConcept(e.target.value)}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-main)',
              fontSize: '0.8rem'
            }}
          >
            <option value="Sliding Window Protocol">Sliding Window Protocol</option>
            <option value="TCP Congestion Control (AIMD)">TCP Congestion Control (AIMD)</option>
            <option value="OSPF & Dijkstra Routing">OSPF & Dijkstra Routing</option>
            <option value="CIDR & Subnet Masking">CIDR & Subnet Masking</option>
          </select>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
          >
            <AIAvatar variant="thinking" size="lg" halo />
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Llama 3 is synthesizing your textbook…
            </div>
            {/* animated shimmer bar */}
            <div style={{ width: '60%', height: 4, borderRadius: 4, overflow: 'hidden', backgroundColor: 'var(--bg-muted)' }}>
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ height: '100%', width: '40%', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', borderRadius: 4 }}
              />
            </div>
          </motion.div>
        ) : summaryData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Core Summary Card */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                lineHeight: 1.65,
                fontSize: '0.92rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                Executive Synthesis
              </div>
              <p>{summaryData.summary}</p>
            </div>

            {/* Expandable Key Points Card */}
            {summaryData.key_points && summaryData.key_points.length > 0 && (
              <div
                style={{
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden'
                }}
              >
                <div
                  onClick={() => setExpandedSection(expandedSection === 'key_points' ? null : 'key_points')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(79, 70, 229, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    <BookmarkCheck size={16} color="var(--primary)" />
                    Key Takeaways & High-Yield Points
                  </div>
                  {expandedSection === 'key_points' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {expandedSection === 'key_points' && (
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {summaryData.key_points.map((pt, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>•</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Expandable Definitions Card */}
            {summaryData.definitions && summaryData.definitions.length > 0 && (
              <div
                style={{
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden'
                }}
              >
                <div
                  onClick={() => setExpandedSection(expandedSection === 'definitions' ? null : 'definitions')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(124, 58, 237, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    <Layers size={16} color="var(--secondary)" />
                    Core Definitions & Terminology
                  </div>
                  {expandedSection === 'definitions' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {expandedSection === 'definitions' && (
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {summaryData.definitions.map((def, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-muted)',
                          fontSize: '0.85rem'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.2rem' }}>
                          {def.term}
                        </div>
                        <div style={{ color: 'var(--text-muted)', lineHeight: 1.45 }}>
                          {def.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
