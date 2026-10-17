"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function CandidatePortal() {
  const [user, setUser] = useState(null);
  const [authTab, setAuthTab] = useState('login');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ apps: 0, resumes: 0 });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await loadStats(currentUser.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) await loadStats(currentUser.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadStats(userId) {
    if (!supabase) return;
    const [{ count: apps }, { count: resumes }] = await Promise.all([
      supabase.from('applications').select('*', { count: 'exact', head: true }).eq('candidate_id', userId),
      supabase.from('resumes').select('*', { count: 'exact', head: true }).eq('candidate_id', userId),
    ]);
    setStats({ apps: apps || 0, resumes: resumes || 0 });
  }

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/candidate' },
    });
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setError('');
    setIsSubmitting(true);

    if (authTab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name } },
      });
      if (error) {
        setError(error.message);
      } else {
        setSignupSuccess(true);
        setAuthTab('login');
      }
    }
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setStats({ apps: 0, resumes: 0 });
  };

  if (loading) {
    return (
      <section className="section active">
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
          <div className="animate-spin" style={{ fontSize: '40px', display: 'inline-block', marginBottom: '16px' }}>⌛</div>
          <p style={{ fontSize: '18px' }}>Loading your portal...</p>
        </div>
      </section>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0];
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <section className="section active" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', margin: '40px auto', padding: '40px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            {user ? (
              avatarUrl ? (
                <img src={avatarUrl} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid white', boxShadow: 'var(--shadow-md)', margin: '0 auto' }} />
              ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 800, margin: '0 auto', boxShadow: 'var(--shadow-md)' }}>
                  {initial}
                </div>
              )
            ) : (
              <div style={{ fontSize: '64px' }}>👤</div>
            )}
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {user ? `Welcome back, ${displayName}!` : 'Candidate Portal'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {user ? user.email : 'Sign in to access your dashboard & AI Resume Analyzer'}
          </p>
        </div>

        {signupSuccess && (
          <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(5, 150, 105, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)', fontWeight: 500, fontSize: '14px', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
            ✓ Account created! Please check your email to confirm, then log in.
          </div>
        )}

        {!user ? (
          <div>
            {/* Auth Tabs */}
            <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
              {['login', 'signup'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setAuthTab(tab); setError(''); }}
                  style={{
                    flex: 1, padding: '12px', border: 'none', background: 'transparent',
                    cursor: 'pointer', fontWeight: 700, fontSize: '15px',
                    color: authTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                    borderBottom: authTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab === 'login' ? '🔑 Login' : '✨ Sign Up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleEmailAuth}>
              {authTab === 'signup' && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Doe" />
                </div>
              )}
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your.email@example.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
              </div>

              {error && (
                <div style={{ padding: '12px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-large" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting}>
                {isSubmitting ? '⏳ Processing...' : (authTab === 'login' ? 'Login' : 'Create Account')}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ padding: '0 16px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            <button
              onClick={handleGoogleLogin}
              style={{
                width: '100%', padding: '14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', background: 'white', color: 'var(--text-primary)',
                cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        ) : (
          <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Applications', value: stats.apps, icon: '📬' },
                { label: 'Resumes Analyzed', value: stats.resumes, icon: '📊' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--primary)', marginBottom: '4px' }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Action Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              <Link href="/candidate/analyzer" style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '32px' }}>✨</div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>AI Resume Analyzer</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Heatmap · Skill gaps · Job matching</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 800 }}>→</div>
                </div>
              </Link>

              <Link href="/candidate/history" style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '32px' }}>📋</div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>My Applications</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Track your application status</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 800 }}>→</div>
                </div>
              </Link>

              <Link href="/apply" style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '32px' }}>🚀</div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Apply for a Job</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Submit your application</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 800 }}>→</div>
                </div>
              </Link>
            </div>

            <button onClick={handleLogout} style={{ width: '100%', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: 'var(--danger)', cursor: 'pointer', fontWeight: 700 }}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
