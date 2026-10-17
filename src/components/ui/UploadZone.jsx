'use client';
import { useState, useRef } from 'react';

/**
 * UploadZone.jsx
 * Polished drag-and-drop file upload zone.
 * Supports PDF, DOCX, TXT with animated states.
 */
export default function UploadZone({ onFileSelect, accept = '.pdf,.docx,.txt', isLoading = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    onFileSelect?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const getFileIcon = (file) => {
    if (!file) return null;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄';
    if (ext === 'docx' || ext === 'doc') return '📝';
    return '📃';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div style={{ width: '100%' }}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={handleChange}
        id="resumeFileInput"
      />

      {!selectedFile ? (
        <div
          onClick={() => !isLoading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            background: isDragging
              ? 'rgba(0, 217, 255, 0.05)'
              : 'rgba(255,255,255,0.02)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow effect when dragging */}
          {isDragging && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(0,217,255,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
          )}

          <div style={{
            fontSize: '3.5rem',
            marginBottom: '1rem',
            filter: isDragging ? 'drop-shadow(0 0 12px var(--primary))' : 'none',
            transition: 'all 0.3s ease',
            transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          }}>
            📤
          </div>

          <p style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: isDragging ? 'var(--primary)' : 'var(--text-primary)',
            marginBottom: '0.5rem',
            transition: 'color 0.3s',
          }}>
            {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            or click to browse files
          </p>
          <div style={{
            display: 'inline-flex',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            {['PDF', 'DOCX', 'TXT'].map(fmt => (
              <span key={fmt} style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                padding: '0.2rem 0.6rem',
                background: 'rgba(0,217,255,0.08)',
                borderRadius: '4px',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}>
                {fmt}
              </span>
            ))}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>· Max 10MB</span>
          </div>
        </div>
      ) : (
        <div style={{
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          background: 'rgba(16,185,129,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>
            {getFileIcon(selectedFile)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '0.25rem',
            }}>
              {selectedFile.name}
            </p>
            <p style={{ color: 'var(--success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>✓</span> Ready to analyze · {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button
              onClick={() => !isLoading && inputRef.current?.click()}
              disabled={isLoading}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s',
              }}
            >
              Change
            </button>
            <button
              onClick={handleRemove}
              disabled={isLoading}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: 'var(--danger)',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s',
              }}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
