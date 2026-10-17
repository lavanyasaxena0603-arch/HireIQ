'use client';

/**
 * ScoreCircle.jsx
 * Animated circular score display using conic-gradient.
 */
export default function ScoreCircle({ score, label, color = 'var(--primary)', size = 120 }) {
  const safeScore = Math.min(100, Math.max(0, score || 0));
  const innerSize = size * 0.72;

  const getScoreColor = (s) => {
    if (s >= 80) return 'var(--success)';
    if (s >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  const scoreColor = color === 'auto' ? getScoreColor(safeScore) : color;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `conic-gradient(${scoreColor} ${safeScore}%, rgba(255,255,255,0.06) 0%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: `0 0 20px ${scoreColor}25`,
        transition: 'all 0.5s ease',
      }}>
        <div style={{
          width: innerSize,
          height: innerSize,
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: size > 100 ? '1.6rem' : '1.2rem',
            fontWeight: 800,
            color: scoreColor,
            lineHeight: 1,
          }}>
            {safeScore}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
        </div>
      </div>
      {label && (
        <span style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          fontWeight: 600,
          textAlign: 'center',
        }}>
          {label}
        </span>
      )}
    </div>
  );
}
