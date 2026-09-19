import React, { useState } from 'react';
import { Textbook } from '../types';
import { api } from '../services/api';
import { BookOpen, Upload, CheckCircle2, Trash2, Sparkles, HelpCircle, FileText, ArrowRight } from 'lucide-react';

interface TextbookManagerProps {
  textbooks: Textbook[];
  onSelectBook: (book: Textbook) => void;
  onRefresh: () => void;
}

export const TextbookManager: React.FC<TextbookManagerProps> = ({ textbooks, onSelectBook, onRefresh }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState(240);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setUploading(true);
    setUploadProgress(20);

    // Simulate multi-stage processing: upload -> chunk -> ChromaDB indexing -> summary
    const timer1 = setTimeout(() => setUploadProgress(55), 400);
    const timer2 = setTimeout(() => setUploadProgress(85), 800);

    await api.uploadTextbook(2, title, author || 'Academic Publisher', pages);
    setUploadProgress(100);

    setTimeout(() => {
      setUploading(false);
      setShowUploadModal(false);
      setTitle('');
      setAuthor('');
      setUploadProgress(0);
      onRefresh();
    }, 400);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header & Upload Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            My Textbook Library
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Upload textbooks, syllabus chapters, and lecture notes for AI summarization & contextual tutoring.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="gradient-brand-btn touch-target"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.7rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          <Upload size={16} /> Upload New Textbook
        </button>
      </div>

      {/* Book Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {textbooks.map(book => (
          <div
            key={book.id}
            className="glass-panel"
            style={{
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
            }}
          >
            {/* Top Bar */}
            <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '70px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: 'var(--shadow-md)',
                  flexShrink: 0
                }}
              >
                <BookOpen size={24} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--success-bg)',
                      color: 'var(--success)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <CheckCircle2 size={10} /> Indexed in ChromaDB
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.2rem' }}>
                  {book.title}
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {book.author}
                </div>
              </div>
            </div>

            {/* Metadata Badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                padding: '0.6rem 0',
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '1rem'
              }}
            >
              <span>📄 {book.total_pages} pages</span>
              <span>💾 {book.file_size}</span>
              <span>📅 {book.uploaded_at}</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => onSelectBook(book)}
                className="gradient-brand-btn touch-target"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={14} /> Open Study Room
              </button>

              <button
                onClick={() => onSelectBook(book)}
                title="Practice Quizzes"
                style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <HelpCircle size={15} color="var(--primary)" /> Quiz
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.3rem' }}>
              Upload New Textbook
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Supported formats: PDF, EPUB, TXT. AARVA extracts chapters, builds ChromaDB vector embeddings, and generates multi-level summaries.
            </p>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Textbook Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry & Reaction Mechanisms"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Author / Publisher
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paula Yurkanis Bruice"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Estimated Page Count
                </label>
                <input
                  type="number"
                  value={pages}
                  onChange={e => setPages(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              {/* Upload Dropzone Preview */}
              <div
                style={{
                  border: '2px dashed var(--border-focus)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--primary-light)',
                  cursor: 'pointer'
                }}
              >
                <FileText size={28} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Drag & Drop PDF file or Browse
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Maximum file size: 50 MB
                </div>
              </div>

              {uploading && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    <span>Embedding chunks into ChromaDB...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--bg-muted)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${uploadProgress}%`, backgroundColor: 'var(--primary)', transition: 'width 250ms' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-main)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="gradient-brand-btn"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  {uploading ? 'Processing...' : 'Upload & Process'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
