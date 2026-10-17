"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function RecruiterDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Database not connected. Check your Supabase configuration.');
      setLoading(false);
      return;
    }

    try {
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (appsError) throw appsError;

      const { data: resumesData } = await supabase
        .from('resumes')
        .select('id, candidate_id, parsed_data, file_name, created_at')
        .order('created_at', { ascending: false });

      const resumeMap = {};
      (resumesData || []).forEach(r => {
        if (!resumeMap[r.candidate_id]) resumeMap[r.candidate_id] = r;
      });

      const merged = (appsData || []).map(app => ({
        ...app,
        resumes: resumeMap[app.candidate_id] || null,
      }));

      setApplications(merged);
    } catch (err) {
      console.error('Recruiter data fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(appId, newStatus) {
    if (!supabase) return;
    const { error } = await supabase.from('applications').update({ status: newStatus }).eq('id', appId);
    if (!error) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    }
  }

  const filtered = applications
    .filter(app => {
      const notes = (() => { try { return JSON.parse(app.notes || '{}'); } catch { return {}; } })();
      const name = notes.name || app.resumes?.parsed_data?.candidate?.name || '';
      const email = notes.email || app.resumes?.parsed_data?.candidate?.email || '';
      const skills = notes.skills || '';
      const query = search.toLowerCase();
      const matchesSearch = !search || name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) || skills.toLowerCase().includes(query);
      const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
      const notesA = (() => { try { return JSON.parse(a.notes || '{}'); } catch { return {}; } })();
      const notesB = (() => { try { return JSON.parse(b.notes || '{}'); } catch { return {}; } })();
      const nameA = notesA.name || '';
      const nameB = notesB.name || '';
      if (sortBy === 'name') return nameA.localeCompare(nameB);
      const scoreA = a.resumes?.parsed_data?.analysis?.overallScore || 0;
      const scoreB = b.resumes?.parsed_data?.analysis?.overallScore || 0;
      return scoreB - scoreA;
    });

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
    interview: applications.filter(a => a.status === 'Interview Ready').length,
    selected: applications.filter(a => a.status === 'Selected').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  const STATUS_OPTIONS = ['Applied', 'Shortlisted', 'Interview Ready', 'Selected', 'Rejected'];

  const getStatusClass = (status) => {
    switch(status) {
      case 'Shortlisted': return 'badge-warning';
      case 'Interview Ready': return 'badge-info';
      case 'Selected': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  return (
    <section className="section active" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 32px' }}>
      
      {/* Header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '40px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.03em' }}>Recruiter Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Live pipeline overview and candidate matching.</p>
        </div>
        <button onClick={loadData} className="btn btn-secondary">
          ↻ Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Total', value: stats.total, icon: '👥' },
          { label: 'Applied', value: stats.applied, icon: '📬' },
          { label: 'Shortlisted', value: stats.shortlisted, icon: '⭐' },
          { label: 'Interview', value: stats.interview, icon: '💬' },
          { label: 'Selected', value: stats.selected, icon: '🏆' },
          { label: 'Rejected', value: stats.rejected, icon: '✗' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '20px', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '48px', margin: 0 }}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto', margin: 0, padding: '16px' }}>
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 'auto', margin: 0, padding: '16px' }}>
          <option value="date">Newest First</option>
          <option value="score">Top AI Score</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="animate-spin" style={{ fontSize: '40px', display: 'inline-block', marginBottom: '16px' }}>⌛</div>
          <h3 style={{ color: 'var(--text-muted)' }}>Loading pipeline...</h3>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', borderColor: 'var(--danger)' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ color: 'var(--danger)', marginBottom: '8px' }}>Database Error</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
          <button onClick={loadData} className="btn btn-primary">Retry Connection</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📭</div>
          <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>{applications.length === 0 ? 'No applications yet' : 'No results found'}</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {applications.length === 0 ? 'Wait for candidates to apply or share your job link.' : 'Try adjusting your search filters.'}
          </p>
        </div>
      ) : (
        <div className="masonry-grid">
          {filtered.map(app => {
            const notes = (() => { try { return JSON.parse(app.notes || '{}'); } catch { return {}; } })();
            const parsed = app.resumes?.parsed_data;
            const candidate = parsed?.candidate || {};
            const analysis = parsed?.analysis || {};
            const name = notes.name || candidate.name || 'Unknown Applicant';
            const email = notes.email || candidate.email || 'No email provided';
            const location = notes.location || candidate.location || '';
            const skills = notes.skills ? notes.skills.split(',').map(s => s.trim()).filter(Boolean) : (parsed?.skills || []).slice(0, 5).map(s => s.name);
            const overallScore = analysis.overallScore;
            const atsScore = analysis.atsScore;
            const initial = name.charAt(0).toUpperCase();

            return (
              <div key={app.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: 'var(--primary)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '20px', flexShrink: 0
                    }}>
                      {initial}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '2px', lineHeight: 1.2 }}>{name}</h3>
                      <span className={`badge ${getStatusClass(app.status)}`} style={{ fontSize: '11px', padding: '2px 8px' }}>{app.status}</span>
                    </div>
                  </div>
                  
                  {overallScore && (
                    <div style={{ textAlign: 'center', background: '#f8fafc', padding: '8px', borderRadius: '12px' }}>
                      <div style={{ fontSize: '20px', fontWeight: 900, color: overallScore >= 80 ? 'var(--success)' : overallScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                        {overallScore}
                      </div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>AI Score</div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>✉️</span> {email}</div>
                  {location && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>📍</span> {location}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>📅</span> {new Date(app.created_at).toLocaleDateString()}</div>
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px', marginTop: 'auto' }}>
                    {skills.slice(0, 5).map((skill, i) => (
                      <span key={i} style={{
                        fontSize: '12px', padding: '4px 10px',
                        background: 'var(--bg-primary)', color: 'var(--text-primary)',
                        borderRadius: '100px', fontWeight: 600, border: '1px solid var(--border)'
                      }}>
                        {skill}
                      </span>
                    ))}
                    {skills.length > 5 && <span style={{ fontSize: '12px', padding: '4px 10px', color: 'var(--text-muted)' }}>+{skills.length - 5}</span>}
                  </div>
                )}

                {/* Actions */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <select
                    value={app.status}
                    onChange={e => updateStatus(app.id, e.target.value)}
                    style={{ flex: 1, padding: '10px', margin: 0, fontSize: '13px', background: 'var(--bg-primary)' }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  
                  {app.resumes && (
                    <button className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '13px' }} onClick={() => alert('View detailed AI report coming soon')}>
                      Report
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
