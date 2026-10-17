'use client';

/**
 * ExperienceTimeline.jsx
 * Visual career timeline from real extracted experience data.
 */
export default function ExperienceTimeline({ experience }) {
  if (!experience || experience.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💼</div>
        <p>No experience found in resume</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: 700,
        marginBottom: '1.5rem',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        ⏳ Career Timeline
      </h3>

      <div style={{ position: 'relative', paddingLeft: '2rem' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '7px',
          top: '8px',
          bottom: '8px',
          width: '2px',
          background: 'linear-gradient(to bottom, var(--primary), var(--secondary))',
          borderRadius: '1px',
        }} />

        {experience.map((exp, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              marginBottom: idx < experience.length - 1 ? '2rem' : 0,
              animation: `fadeIn 0.5s ease ${idx * 0.1}s both`,
            }}
          >
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '-1.65rem',
              top: '6px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: exp.is_current
                ? 'var(--primary)'
                : 'linear-gradient(135deg, var(--secondary), var(--primary))',
              border: '2px solid var(--bg-primary)',
              boxShadow: exp.is_current ? '0 0 10px var(--primary)' : 'none',
            }}>
              {exp.is_current && (
                <div style={{
                  position: 'absolute',
                  inset: '-4px',
                  borderRadius: '50%',
                  border: '2px solid var(--primary)',
                  opacity: 0.4,
                  animation: 'pulse 2s infinite',
                }} />
              )}
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '1.25rem',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid rgba(0,217,255,0.2)';
                e.currentTarget.style.background = 'rgba(0,217,255,0.03)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>
                    {exp.title}
                  </h4>
                  <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {exp.company}
                    {exp.location && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {exp.location}</span>}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.78rem',
                    color: exp.is_current ? 'var(--primary)' : 'var(--text-muted)',
                    background: exp.is_current ? 'rgba(0,217,255,0.1)' : 'rgba(255,255,255,0.05)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '20px',
                    fontWeight: exp.is_current ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}>
                    {exp.start_date} — {exp.is_current ? '🟢 Present' : (exp.end_date || 'Present')}
                  </span>
                </div>
              </div>

              {exp.description && (
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  marginBottom: exp.achievements?.length > 0 ? '0.75rem' : 0,
                }}>
                  {exp.description}
                </p>
              )}

              {exp.achievements && exp.achievements.length > 0 && (
                <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                  {exp.achievements.map((ach, i) => (
                    <li key={i} style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      marginBottom: '0.25rem',
                      listStyleType: 'none',
                      paddingLeft: '0',
                    }}>
                      <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>›</span>
                      {ach}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
