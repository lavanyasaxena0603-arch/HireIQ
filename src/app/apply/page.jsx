"use client";
import Link from 'next/link';
import { useState } from 'react';
import UploadZone from '@/components/ui/UploadZone';

export default function ApplicationForm() {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    skills: '',
    message: '',
  });

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { supabase } = await import('@/lib/supabase');
      if (!supabase) throw new Error('Database not available');

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('You must be logged in to apply. Please sign in first.');
        setIsSubmitting(false);
        return;
      }

      const formData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: form.location,
        linkedin: form.linkedin,
        skills: form.skills,
        message: form.message,
        fileName: file ? file.name : null,
      };

      const { submitApplication } = await import('@/actions/candidate');
      const res = await submitApplication(null, formData, session.access_token);

      if (res.success) {
        setSubmitted(true);
        // Auto-analyze resume if file was uploaded
        if (file && form.name) {
          try {
            const { extractResumeText } = await import('@/lib/resumeParser');
            const text = await extractResumeText(file);
            if (text && text.length > 50) {
              const analysisRes = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText: text, mode: 'general' }),
              });
              const analysisJson = await analysisRes.json();
              if (analysisJson.success) {
                const { saveResumeAnalysis } = await import('@/actions/candidate');
                await saveResumeAnalysis(text, analysisJson.data, session.access_token, file.name);
              }
            }
          } catch (analysisErr) {
            console.warn('Auto-analysis skipped:', analysisErr.message);
          }
        }
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      setError('Failed to submit application: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="section active">
        <div className="card" style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '60px 40px' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'rgba(5, 150, 105, 0.1)',
            color: 'var(--success)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', margin: '0 auto 24px auto',
          }}>
            ✓
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>
            Application Submitted!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginBottom: '8px' }}>
            Your application has been received. We also analyzed your resume automatically.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>
            Track your status in the Candidate Dashboard.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/candidate/history" className="btn btn-primary">
              View My Applications →
            </Link>
            <Link href="/candidate/analyzer" className="btn btn-secondary">
              View Resume Analysis
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section active">
      <div style={{ maxWidth: '760px', margin: '40px auto' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.03em' }}>
            Apply for a Position
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
            Submit your application — we'll auto-analyze your resume with AI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: '48px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Personal Info Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Full Name *</label>
                <input type="text" required placeholder="Jane Doe" value={form.name} onChange={handleChange('name')} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Email Address *</label>
                <input type="email" required placeholder="jane@email.com" value={form.email} onChange={handleChange('email')} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Phone</label>
                <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handleChange('phone')} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Location</label>
                <input type="text" placeholder="City, Country" value={form.location} onChange={handleChange('location')} />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>LinkedIn Profile URL</label>
              <input type="url" placeholder="https://linkedin.com/in/yourname" value={form.linkedin} onChange={handleChange('linkedin')} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Key Skills</label>
              <input type="text" placeholder="React, Node.js, Python, SQL..." value={form.skills} onChange={handleChange('skills')} />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Separate with commas</p>
            </div>

            {/* Resume Upload */}
            <div className="form-group" style={{ margin: 0 }}>
              <label>Resume / CV *</label>
              <UploadZone onFileSelect={setFile} isLoading={isSubmitting} />
            </div>

            {/* Cover Note */}
            <div className="form-group" style={{ margin: 0 }}>
              <label>Cover Note (Optional)</label>
              <textarea
                placeholder="Tell us about yourself and why you're applying..."
                value={form.message}
                onChange={handleChange('message')}
                rows={4}
              />
            </div>

            {error && (
              <div style={{
                padding: '16px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)',
                borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '14px', fontWeight: 500
              }}>
                ⚠️ {error}
                {error.includes('logged in') && (
                  <Link href="/candidate" style={{ color: 'var(--accent)', marginLeft: '8px', fontWeight: 700 }}>
                    Sign In →
                  </Link>
                )}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-large" style={{ marginTop: '16px' }}>
              {isSubmitting ? (
                <><span className="animate-spin">⌛</span> Submitting...</>
              ) : (
                <>Submit Application</>
              )}
            </button>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Your resume will be automatically analyzed by AI after submission.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
