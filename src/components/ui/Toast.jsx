/**
 * Toast.jsx
 * Global toast notification system — replaces all alert() calls.
 * Usage: import { useToast, ToastContainer } from '@/components/ui/Toast';
 */
'use client';
import { useState, useCallback, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur || 6000),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if used outside provider
    return {
      success: (msg) => console.log('[toast success]', msg),
      error: (msg) => console.error('[toast error]', msg),
      info: (msg) => console.info('[toast info]', msg),
      warning: (msg) => console.warn('[toast warning]', msg),
    };
  }
  return ctx;
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const colors = {
    success: 'var(--success)',
    error: 'var(--danger)',
    warning: 'var(--warning)',
    info: 'var(--primary)',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        background: 'var(--bg-secondary)',
        border: `1px solid ${colors[toast.type]}40`,
        borderLeft: `4px solid ${colors[toast.type]}`,
        borderRadius: '10px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        animation: 'slideInRight 0.3s ease',
        minWidth: '280px',
        maxWidth: '420px',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: `${colors[toast.type]}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors[toast.type],
        fontWeight: 'bold',
        fontSize: '0.8rem',
        flexShrink: 0,
        marginTop: '1px',
      }}>
        {icons[toast.type]}
      </div>
      <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: '0',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div style={{
      position: 'fixed',
      top: '1.5rem',
      right: '1.5rem',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'all' }}>
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
