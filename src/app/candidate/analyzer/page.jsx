"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import UploadZone from '@/components/ui/UploadZone';
import ScoreCircle from '@/components/ui/ScoreCircle';
import ResumeHeatmap from '@/components/ui/ResumeHeatmap';
import ExperienceTimeline from '@/components/ui/ExperienceTimeline';
import SkillGapAnalyzer from '@/components/ui/SkillGapAnalyzer';
import JobRadar from '@/components/ui/JobRadar';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [mode, setMode] = useState('general');
  const [jobDescription, setJobDescription] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('scores');
  const [extractError, setExtractError] = useState(null);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
      });
    }
  }, []);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setResumeText('');
    setExtractError(null);

    if (!selectedFile) return;

    setIsExtracting(true);
    try {
      const { extractResumeText, validateResumeFile } = await import('@/lib/resumeParser');
      const validation = validateResumeFile(selectedFile);
      if (!validation.valid) {
        setExtractError(validation.error);
        setIsExtracting(false);
        return;
      }
      const text = await extractResumeText(selectedFile);
      setResumeText(text);
    } catch (err) {
      console.error('Text extraction error:', err);
      setExtractError(`Could not extract text: ${err.message}. You can paste your resume text below.`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText || resumeText.trim().length < 50) {
      alert('Please upload a resume or paste your resume text (minimum 50 characters).');
      return;
    }
    setIsAnalyzing(true);
    setSaveStatus(null);
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription, mode }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      const data = json.data;
      setResult(data);
      setActiveTab('scores');

      if (user && supabase) {
        setSaveStatus('saving');
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { saveResumeAnalysis } = await import('@/actions/candidate');
          const saveRes = await saveResumeAnalysis(
            resumeText,
            data,
            session.access_token,
            file?.name || null
          );
          setSaveStatus(saveRes.success ? 'saved' : 'error');
        }
      }
    } catch (err) {
      alert('Analysis failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportJSON = () => {
    if (!result) return;
    const json = JSON.stringify(result, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const analysis = result?.analysis || {};

  const TABS = [
    { id: 'scores', label: '📊 Scores' },
    { id: 'profile', label: '👤 Profile' },
    { id: 'experience', label: '💼 Experience' },
    { id: 'skills', label: '⚡ Skills & Gaps' },
    { id: 'heatmap', label: '🔥 Heatmap' },
    { id: 'radar', label: '📡 Job Match' },
    { id: 'insights', label: '💡 Insights' },
  ];

  return (
    <section className="section active" style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.02em' }}>
              ✨ AI Resume Analyzer
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              Full NLP analysis · Heatmap · Job matching · Skill gaps · Career timeline
            </p>
          </div>
          {result && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setResult(null); setFile(null); setResumeText(''); setSaveStatus(null); }} className="btn">
                ↩ Analyze Another
              </button>
              <button onClick={handleExportJSON} className="btn btn-secondary">
                ⬇ Export JSON
              </button>
            </div>
          )}

          {saveStatus && (
            <div style={{
              width: '100%', marginTop: '8px', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600,
              background: saveStatus === 'saved' ? '#ecfdf5' : saveStatus === 'saving' ? 'var(--bg-primary)' : '#fef2f2',
              color: saveStatus === 'saved' ? 'var(--success)' : saveStatus === 'saving' ? 'var(--primary)' : 'var(--danger)',
              border: `1px solid ${saveStatus === 'saved' ? '#a7f3d0' : saveStatus === 'saving' ? 'var(--border)' : '#fecaca'}`,
            }}>
              {saveStatus === 'saving' && <span className="animate-spin">⌛</span>}
              {saveStatus === 'saved' && '✓'}
              {saveStatus === 'error' && '⚠️'}
              {saveStatus === 'saving' ? 'Saving to your account...' : saveStatus === 'saved' ? 'Saved to your Resume Center' : 'Could not save — check your connection'}
            </div>
          )}
        </div>

        {/* Upload Form */}
        {!result && (
          <div className="card" style={{ padding: '40px' }}>
            
            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                Analysis Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {[
                  { id: 'general', label: '📄 General Evaluation', desc: 'Overall quality + ATS score' },
                  { id: 'tailored', label: '🎯 Job Tailored', desc: 'Match against a job description' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    style={{
                      padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                      border: `2px solid ${mode === m.id ? 'var(--primary)' : 'var(--border)'}`,
                      background: mode === m.id ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: mode === m.id ? 'var(--primary)' : 'var(--text-primary)', marginBottom: '4px' }}>{m.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                Upload Resume
              </label>
              <UploadZone onFileSelect={handleFileSelect} isLoading={isExtracting || isAnalyzing} />
              {isExtracting && (
                <p style={{ color: 'var(--primary)', fontSize: '14px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <span className="animate-spin">⌛</span> Extracting text from your resume...
                </p>
              )}
              {extractError && (
                <p style={{ color: 'var(--warning)', fontSize: '14px', marginTop: '12px', fontWeight: 500 }}>⚠️ {extractError}</p>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                Resume Text {resumeText && <span style={{ color: 'var(--success)', fontWeight: 600, textTransform: 'none' }}>✓ {resumeText.length.toLocaleString()} characters extracted</span>}
              </label>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                rows={5}
                placeholder="Resume text appears here after upload, or paste it manually..."
                style={{ width: '100%', padding: '16px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontFamily: 'monospace', lineHeight: 1.5, resize: 'vertical' }}
              />
            </div>

            {mode === 'tailored' && (
              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  rows={6}
                  placeholder="Paste the target job description here to get a tailored match score..."
                  style={{ width: '100%', padding: '16px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', lineHeight: 1.5, resize: 'vertical' }}
                />
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || isExtracting || !resumeText}
              className="btn btn-primary btn-large"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isAnalyzing ? <><span className="animate-spin">⚙️</span> Analyzing with AI...</> : <>✨ Analyze Resume</>}
            </button>

            {!user && (
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '16px' }}>
                <Link href="/candidate" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</Link> to save your analysis history
              </p>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* Candidate Banner */}
            {result.candidate?.name && (
              <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff, #eff6ff)', border: 'none', display: 'flex', alignItems: 'center', gap: '20px', padding: '32px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 800, flexShrink: 0 }}>
                  {result.candidate.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>{result.candidate.name}</h3>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {result.candidate.email && <span>📧 {result.candidate.email}</span>}
                    {result.candidate.phone && <span>📱 {result.candidate.phone}</span>}
                    {result.candidate.location && <span>📍 {result.candidate.location}</span>}
                  </div>
                </div>
                {analysis.overallScore > 0 && (
                  <div style={{ textAlign: 'center', background: 'white', padding: '12px 20px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: analysis.overallScore >= 80 ? 'var(--success)' : analysis.overallScore >= 60 ? 'var(--warning)' : 'var(--danger)', lineHeight: 1 }}>
                      {analysis.overallScore}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>Overall Score</div>
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-primary)', padding: '6px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflowX: 'auto' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '10px 16px', borderRadius: 'var(--radius-md)', border: 'none', whiteSpace: 'nowrap',
                    background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                    cursor: 'pointer', fontWeight: 700, fontSize: '14px', transition: 'all 0.2s',
                    boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="card" style={{ padding: '40px' }}>
              
              {activeTab === 'scores' && (
                <div>
                  <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
                    <ScoreCircle score={analysis.overallScore} label="Overall Score" color="auto" size={140} />
                    <ScoreCircle score={analysis.atsScore} label="ATS Match" color="var(--primary)" size={140} />
                    <ScoreCircle score={analysis.keywordScore} label="Keywords" color="var(--secondary)" size={140} />
                    <ScoreCircle score={analysis.contentScore} label="Content" color="var(--warning)" size={140} />
                    {analysis.jdMatchScore != null && (
                      <ScoreCircle score={analysis.jdMatchScore} label="JD Match" color="var(--success)" size={140} />
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    {[
                      { label: 'Format Score', value: analysis.formatScore, color: 'var(--primary)' },
                      { label: 'Content Quality', value: analysis.contentScore, color: 'var(--secondary)' },
                      { label: 'Keyword Density', value: analysis.keywordScore, color: 'var(--warning)' },
                      { label: 'ATS Parsability', value: analysis.atsScore, color: 'var(--success)' },
                    ].map(item => (
                      <div key={item.label} style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: item.color }}>{item.value || 0}%</span>
                        </div>
                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${item.value || 0}%`, background: item.color, transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div style={{ display: 'grid', gap: '32px' }}>
                  {result.summary && (
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Professional Summary</h4>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '16px' }}>{result.summary}</p>
                    </div>
                  )}
                  {result.education?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>🎓 Education</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {result.education.map((edu, i) => (
                          <div key={i} style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '4px' }}>{edu.degree} in {edu.field}</div>
                            <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>{edu.institution}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>{edu.year} {edu.gpa && `· GPA: ${edu.gpa}`}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.certifications?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>🏆 Certifications</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {result.certifications.map((cert, i) => (
                          <div key={i} style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontWeight: 800, color: 'var(--warning)', fontSize: '15px', marginBottom: '4px' }}>{cert.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>{cert.issuer} {cert.date && `· ${cert.date}`}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.projects?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>🚀 Projects</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {result.projects.map((proj, i) => (
                          <div key={i} style={{ background: '#f8fafc', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ fontWeight: 800, fontSize: '16px' }}>{proj.name}</div>
                              {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700 }}>🔗 View Project</a>}
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>{proj.description}</p>
                            {proj.technologies?.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {proj.technologies.map((t, j) => (
                                  <span key={j} style={{ fontSize: '12px', padding: '4px 10px', background: '#eff6ff', color: 'var(--primary)', borderRadius: '100px', fontWeight: 600 }}>{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'experience' && <ExperienceTimeline experience={result.experience} />}
              
              {activeTab === 'skills' && <SkillGapAnalyzer skills={result.skills} missingKeywords={analysis.missingKeywords} jobMatching={analysis.jobMatching} />}
              
              {activeTab === 'heatmap' && <ResumeHeatmap heatmapData={analysis.heatmapData} />}
              
              {activeTab === 'radar' && <JobRadar jobMatching={analysis.jobMatching} />}

              {activeTab === 'insights' && (
                <div style={{ display: 'grid', gap: '32px' }}>
                  {analysis.strengths?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>⭐ Key Strengths</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analysis.strengths.map((s, i) => (
                          <div key={i} style={{ padding: '16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--success)', fontWeight: 800 }}>✓</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.areasForImprovement?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--danger)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>⚠️ Areas for Improvement</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analysis.areasForImprovement.map((a, i) => (
                          <div key={i} style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--danger)', fontWeight: 800 }}>!</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.recommendations?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>💡 AI Recommendations</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analysis.recommendations.map((r, i) => (
                          <div key={i} style={{ padding: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>→</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </section>
  );
}
