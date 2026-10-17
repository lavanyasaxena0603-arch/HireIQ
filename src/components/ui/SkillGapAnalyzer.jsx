'use client';

/**
 * SkillGapAnalyzer.jsx
 * Shows skill gaps for target roles based on real Gemini analysis data.
 */
export default function SkillGapAnalyzer({ skills, missingKeywords, jobMatching }) {
  const hasData = skills?.length > 0 || missingKeywords?.length > 0;

  if (!hasData) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
        <p>No skill data available</p>
      </div>
    );
  }

  // Group skills by category
  const skillsByCategory = {};
  (skills || []).forEach(skill => {
    const cat = skill.category || 'other';
    if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
    skillsByCategory[cat].push(skill);
  });

  const categoryLabels = {
    programming: '💻 Programming',
    frontend: '🎨 Frontend',
    backend: '⚙️ Backend',
    database: '🗄️ Database',
    cloud: '☁️ Cloud',
    devops: '🔧 DevOps',
    design: '🖌️ Design',
    management: '📊 Management',
    soft: '🤝 Soft Skills',
    other: '📌 Other',
  };

  const getSkillBarColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--primary)';
    if (score >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  // Best matching role
  const topRole = jobMatching
    ? Object.entries(jobMatching).sort((a, b) => b[1] - a[1])[0]
    : null;

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
        ⚡ Skill Analysis & Gap
      </h3>

      {/* Best Role Match */}
      {topRole && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,217,255,0.08), rgba(99,102,241,0.08))',
          border: '1px solid rgba(0,217,255,0.2)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Best Role Match</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
              🎯 {topRole[0]}
            </div>
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--primary)',
          }}>
            {topRole[1]}%
          </div>
        </div>
      )}

      {/* Skills by Category */}
      <div style={{ marginBottom: '1.5rem' }}>
        {Object.entries(skillsByCategory).map(([cat, catSkills]) => (
          <div key={cat} style={{ marginBottom: '1.25rem' }}>
            <h4 style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}>
              {categoryLabels[cat] || cat}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {catSkills.map((skill, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {skill.name}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {skill.score || 0}%
                    </span>
                  </div>
                  <div style={{
                    height: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${skill.score || 0}%`,
                      background: getSkillBarColor(skill.score || 0),
                      borderRadius: '3px',
                      transition: 'width 1s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Missing Keywords / Gaps */}
      {missingKeywords && missingKeywords.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.05)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '12px',
          padding: '1.25rem',
        }}>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--danger)',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            ⚠️ Missing Keywords / Skills Gap
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {missingKeywords.map((kw, i) => (
              <span key={i} style={{
                fontSize: '0.8rem',
                padding: '0.25rem 0.75rem',
                background: 'rgba(239,68,68,0.1)',
                color: 'var(--danger)',
                borderRadius: '20px',
                border: '1px solid rgba(239,68,68,0.2)',
                fontWeight: 500,
              }}>
                + {kw}
              </span>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Adding these to your resume can significantly improve your ATS score and job match rate.
          </p>
        </div>
      )}
    </div>
  );
}
