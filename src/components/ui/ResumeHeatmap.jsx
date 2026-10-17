'use client';

/**
 * ResumeHeatmap.jsx
 * Visual heatmap showing strength distribution across resume sections.
 * Populated with real Gemini analysis data.
 */
export default function ResumeHeatmap({ heatmapData }) {
  if (!heatmapData) return null;

  const sections = [
    { key: 'contact', label: 'Contact Info', icon: '👤' },
    { key: 'summary', label: 'Summary', icon: '📋' },
    { key: 'experience', label: 'Experience', icon: '💼' },
    { key: 'education', label: 'Education', icon: '🎓' },
    { key: 'skills', label: 'Skills', icon: '⚡' },
    { key: 'projects', label: 'Projects', icon: '🚀' },
    { key: 'certifications', label: 'Certifications', icon: '🏆' },
  ];

  const getHeatColor = (score) => {
    if (score >= 80) return { bg: 'rgba(16,185,129,0.25)', border: 'rgba(16,185,129,0.5)', text: '#10b981' };
    if (score >= 60) return { bg: 'rgba(245,158,11,0.2)', border: 'rgba(245,158,11,0.4)', text: '#f59e0b' };
    if (score >= 30) return { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)', text: '#ef4444' };
    return { bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)', text: '#6b7280' };
  };

  const getLabel = (score) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 30) return 'Needs Work';
    return 'Missing';
  };

  return (
    <div>
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: 700,
        marginBottom: '1.25rem',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        🔥 Resume Heatmap
        <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>
          — section strength distribution
        </span>
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {sections.map(({ key, label, icon }) => {
          const score = heatmapData[key] || 0;
          const colors = getHeatColor(score);
          return (
            <div
              key={key}
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
                transition: 'transform 0.2s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{icon}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                {label}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: colors.text, marginBottom: '0.25rem' }}>
                {score}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: colors.text,
                fontWeight: 600,
                padding: '0.15rem 0.5rem',
                background: colors.bg,
                borderRadius: '10px',
                display: 'inline-block',
              }}>
                {getLabel(score)}
              </div>
              {/* Progress bar */}
              <div style={{
                marginTop: '0.6rem',
                height: '4px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${score}%`,
                  background: colors.text,
                  borderRadius: '2px',
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        marginTop: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {[
          { label: 'Strong (80+)', color: '#10b981' },
          { label: 'Good (60-79)', color: '#f59e0b' },
          { label: 'Needs Work (30-59)', color: '#ef4444' },
          { label: 'Missing (0-29)', color: '#6b7280' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
