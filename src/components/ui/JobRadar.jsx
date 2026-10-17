'use client';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';

/**
 * JobRadar.jsx
 * Multi-axis radar chart showing job role match percentages.
 * Uses recharts, fed from real Gemini job matching data.
 */
export default function JobRadar({ jobMatching }) {
  if (!jobMatching || Object.keys(jobMatching).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📡</div>
        <p>No job matching data available</p>
      </div>
    );
  }

  const data = Object.entries(jobMatching).map(([role, score]) => ({
    role: role.replace(' Developer', ' Dev').replace('Engineer', 'Eng'),
    score: score || 0,
    fullMark: 100,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(0,217,255,0.2)',
          borderRadius: '8px',
          padding: '0.6rem 0.9rem',
          fontSize: '0.85rem',
        }}>
          <p style={{ color: 'var(--primary)', fontWeight: 700, margin: 0 }}>
            {entry.payload.role}
          </p>
          <p style={{ color: 'var(--text-primary)', margin: '0.2rem 0 0' }}>
            Match: <strong>{entry.value}%</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  // Top 3 roles
  const sorted = [...data].sort((a, b) => b.score - a.score);

  return (
    <div>
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: 700,
        marginBottom: '1rem',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        📡 Job Role Fit Radar
      </h3>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="role"
              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }}
            />
            <Radar
              name="Match"
              dataKey="score"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Top matches */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        {sorted.slice(0, 3).map((item, i) => (
          <div key={item.role} style={{
            flex: 1,
            minWidth: '100px',
            background: i === 0 ? 'rgba(0,217,255,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${i === 0 ? 'rgba(0,217,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '10px',
            padding: '0.75rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              #{i + 1} Match
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: i === 0 ? 'var(--primary)' : 'var(--text-primary)' }}>
              {item.score}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {item.role}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
