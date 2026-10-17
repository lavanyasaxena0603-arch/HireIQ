"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', minHeight: '100vh' }}>
      
      {/* Hero Section */}
      <section style={{ 
        textAlign: 'center', 
        padding: '80px 0 60px 0',
        animation: 'slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1)' 
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(37, 99, 235, 0.1)',
          color: 'var(--accent)',
          padding: '8px 16px',
          borderRadius: '100px',
          fontWeight: 700,
          fontSize: '14px',
          marginBottom: '32px'
        }}>
          <span>✨</span> Introducing Next-Gen AI Recruiting
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(48px, 8vw, 84px)', 
          fontWeight: 900, 
          letterSpacing: '-0.04em', 
          lineHeight: 1.05,
          color: 'var(--primary)',
          marginBottom: '24px',
          maxWidth: '1000px',
          margin: '0 auto 24px auto'
        }}>
          Find the perfect fit.
          <br />
          <span style={{ color: 'var(--accent)' }}>Without the friction.</span>
        </h1>
        
        <p style={{
          fontSize: 'clamp(18px, 2vw, 24px)',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto 48px auto',
          lineHeight: 1.5
        }}>
          HireIQ uses advanced NLP and AI to instantly analyze resumes, uncover skill gaps, and match top talent to your open roles.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/apply" className="btn btn-primary btn-large">
            Apply for a Job
          </Link>
          <Link href="/recruiter" className="btn btn-secondary btn-large">
            Recruiter Dashboard
          </Link>
        </div>
      </section>

      {/* Masonry / Bento Grid Features */}
      <section style={{ padding: '60px 0 100px 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          
          {/* Large Card */}
          <div className="card" style={{ 
            gridColumn: '1 / -1', 
            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
            padding: '48px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
              <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Deep NLP Parsing</h2>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
                Our Gemini-powered engine reads PDFs and DOCX files like a human recruiter, extracting rich structured data including missing keywords and exact ATS compatibility scores.
              </p>
            </div>
            <div style={{ 
              flex: '1', 
              minWidth: '300px',
              background: 'white',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: 'var(--shadow-lg)',
              transform: 'rotate(2deg)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontWeight: 700 }}>Candidate Analysis</span>
                <span className="badge badge-success">98% Match</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '12px' }}>
                <div style={{ width: '98%', height: '100%', background: 'var(--success)', borderRadius: '4px' }}></div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px' }}>
                {['React', 'Node.js', 'Python', 'AWS'].map(s => (
                  <span key={s} style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Medium Cards */}
          <div className="card" style={{ padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '20px', color: 'var(--accent)' }}>📊</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Actionable Insights</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Stop guessing. Get detailed radar charts, skill gap analyses, and timeline extractions for every applicant instantly.
            </p>
          </div>

          <div className="card" style={{ padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '20px', color: '#10b981' }}>⚡</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Frictionless Apply</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Candidates simply drag and drop their resume. We extract all fields and automatically generate an intelligent profile.
            </p>
          </div>

          <div className="card" style={{ padding: '40px', gridColumn: 'auto / span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                <i className="fas fa-lock"></i>
              </div>
              <div>
                <h3 style={{ fontSize: '24px', margin: 0 }}>Enterprise Security</h3>
                <p style={{ color: 'var(--text-muted)' }}>Powered by Supabase Auth & RLS</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Your data is siloed and secured. Candidates can only see their own applications, while recruiters have God-view access with strict Role-Based Access Controls.
            </p>
          </div>

        </div>
      </section>
      
    </div>
  );
}
