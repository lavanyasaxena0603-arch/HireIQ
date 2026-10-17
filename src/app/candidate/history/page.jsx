"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const getStatusClass = (status) => {
  switch(status) {
    case 'Shortlisted': return 'badge-warning';
    case 'Interview Ready': return 'badge-info';
    case 'Selected': return 'badge-success';
    case 'Rejected': return 'badge-danger';
    default: return 'badge-primary';
  }
};

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      if (!supabase) { setLoading(false); return; }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      setLoggedIn(true);

      const [appsRes, resumesRes] = await Promise.all([
        import('@/actions/candidate').then(m => m.fetchMyApplications(session.access_token)),
        import('@/actions/candidate').then(m => m.fetchMyResumes(session.access_token)),
      ]);

      if (appsRes.success) setApplications(appsRes.data || []);
      if (resumesRes.success) setResumes(resumesRes.data || []);
      setLoading(false);
    }

    fetchAll();
  }, []);

  if (loading) {
    return (
      <section className="section active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="animate-spin" style={{ fontSize: '40px', display: 'inline-block', marginBottom: '16px' }}>⌛</div>
          <p style={{ fontSize: '18px' }}>Loading your history...</p>
        </div>
      </section>
    );
  }

  if (!loggedIn) {
    return (
      <section className="section active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '500px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Sign in Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Please sign in to view your application history and resume analyses.
          </p>
          <Link href="/candidate" className="btn btn-primary btn-large" style={{ display: 'inline-flex' }}>
            Sign In →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section active" style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '4px', letterSpacing: '-0.02em' }}>
              My History
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>Track your applications and resume analyses.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/apply" className="btn" style={{ background: '#ecfdf5', color: 'var(--success)', border: '1px solid #a7f3d0' }}>
              + Apply
            </Link>
            <Link href="/candidate/analyzer" className="btn btn-primary">
              ✨ Analyze Resume
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '24px',
          background: 'var(--bg-primary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '6px'
        }}>
          {[
            { id: 'applications', label: `📬 Applications (${applications.length})` },
            { id: 'resumes', label: `📊 Resume Analyses (${resumes.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-md)', border: 'none',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div>
            {applications.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>No applications yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Apply for your first job position to see it here.
                </p>
                <Link href="/apply" className="btn btn-primary">
                  🚀 Apply Now
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {applications.map(app => {
                  const notes = (() => { try { return JSON.parse(app.notes || '{}'); } catch { return {}; } })();
                  return (
                    <div key={app.id} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '16px' }}>
                          {notes.name || 'Application'} — {notes.email || ''}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          <span>📅 {new Date(app.created_at).toLocaleDateString()}</span>
                          {notes.location && <span>📍 {notes.location}</span>}
                          {notes.fileName && <span>📎 {notes.fileName}</span>}
                        </div>
                        {notes.skills && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {notes.skills.split(',').slice(0, 5).map((s, i) => (
                              <span key={i} style={{ fontSize: '12px', padding: '4px 10px', background: 'var(--bg-primary)', color: 'var(--text-secondary)', borderRadius: '100px', border: '1px solid var(--border)', fontWeight: 600 }}>
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`badge ${getStatusClass(app.status)}`} style={{ padding: '6px 12px', fontSize: '12px' }}>
                        {app.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RESUMES TAB */}
        {activeTab === 'resumes' && (
          <div>
            {resumes.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>No analyses yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Upload your resume for AI analysis to see results here.
                </p>
                <Link href="/candidate/analyzer" className="btn btn-primary">
                  ✨ Analyze Now
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {resumes.map(resume => {
                  const parsed = resume.parsed_data;
                  const analysis = parsed?.analysis || {};
                  const candidate = parsed?.candidate || {};
                  const overallScore = analysis.overallScore;
                  const atsScore = analysis.atsScore;
                  const name = candidate.name || resume.file_name || 'Resume';
                  const topSkills = (parsed?.skills || []).slice(0, 5).map(s => s.name);

                  return (
                    <div key={resume.id} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '18px' }}>📄</span>
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '16px' }}>{name}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          📅 {new Date(resume.created_at).toLocaleDateString()}
                          {candidate.email && ` · ${candidate.email}`}
                        </div>
                        {topSkills.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {topSkills.map((s, i) => (
                              <span key={i} style={{ fontSize: '12px', padding: '4px 10px', background: 'var(--bg-primary)', color: 'var(--text-secondary)', borderRadius: '100px', border: '1px solid var(--border)', fontWeight: 600 }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0, background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                        {overallScore != null && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: overallScore >= 80 ? 'var(--success)' : overallScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                              {overallScore}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Score</div>
                          </div>
                        )}
                        {atsScore != null && (
                          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary)' }}>
                              {atsScore}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ATS</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
