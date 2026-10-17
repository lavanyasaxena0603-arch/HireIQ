/**
 * nlpPrompt.js
 * Centralized Gemini prompt templates for resume NLP extraction.
 * Returns a full canonical resume JSON used across the entire platform.
 */

export function buildResumeAnalysisPrompt(resumeText, jobDescription = null, mode = 'general') {
  const jdSection = mode === 'tailored' && jobDescription
    ? `\n\nTarget Job Description:\n${jobDescription}\n\nAnalyze match percentage, keyword gaps, and tailored recommendations for this specific role.`
    : '';

  return `You are an expert ATS system and technical recruiter with 15 years of experience. Analyze the following resume and extract ALL information with high accuracy.

Resume Text:
${resumeText}
${jdSection}

Return ONLY a valid JSON object with NO markdown, NO code fences, NO explanation text — pure JSON only.

The JSON must follow this exact structure:

{
  "candidate": {
    "name": "extracted full name or null",
    "email": "extracted email or null",
    "phone": "extracted phone or null",
    "location": "extracted city/country or null"
  },
  "summary": "extracted professional summary or objective, or null if none",
  "skills": [
    { "name": "skill name", "category": "programming|frontend|backend|database|cloud|devops|design|management|soft|other", "score": 75 }
  ],
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "location": "city or remote or null",
      "start_date": "Mon YYYY or YYYY or null",
      "end_date": "Mon YYYY or Present or null",
      "is_current": false,
      "description": "role description",
      "achievements": ["achievement 1", "achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "degree type e.g. Bachelor of Science",
      "institution": "university/college name",
      "field": "field of study",
      "year": "graduation year or expected year",
      "gpa": "GPA if mentioned or null"
    }
  ],
  "projects": [
    {
      "name": "project name",
      "description": "what the project does",
      "technologies": ["tech1", "tech2"],
      "url": "github/live URL or null"
    }
  ],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "date": "date obtained or null",
      "url": "verification URL or null"
    }
  ],
  "achievements": ["achievement or award 1", "achievement 2"],
  "links": [
    { "type": "github|linkedin|portfolio|twitter|other", "url": "full URL" }
  ],
  "languages": [
    { "name": "language name", "proficiency": "native|fluent|professional|beginner" }
  ],
  "analysis": {
    "atsScore": 0,
    "overallScore": 0,
    "jdMatchScore": ${mode === 'tailored' ? '0' : 'null'},
    "keywordScore": 0,
    "formatScore": 0,
    "contentScore": 0,
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "areasForImprovement": ["improvement 1", "improvement 2"],
    "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
    "missingKeywords": ["keyword1", "keyword2"],
    "heatmapData": {
      "contact": 0,
      "summary": 0,
      "experience": 0,
      "education": 0,
      "skills": 0,
      "projects": 0,
      "certifications": 0
    },
    "jobMatching": {
      "Frontend Developer": 0,
      "Backend Developer": 0,
      "Full Stack Developer": 0,
      "Data Scientist": 0,
      "DevOps Engineer": 0,
      "Product Manager": 0
    }
  }
}

Scoring Instructions:
- atsScore (0-100): How well the resume will pass ATS filters. Check for keywords, formatting, section headers, no images/tables in text.
- overallScore (0-100): Holistic quality — experience relevance, skill depth, achievements, clarity.
- jdMatchScore (0-100): Only if job description is provided. How well candidate matches the role.
- keywordScore (0-100): Density and relevance of industry keywords.
- formatScore (0-100): Structure, readability, appropriate length, consistent formatting.
- contentScore (0-100): Depth of content — quantified achievements, impact statements, specificity.
- heatmapData: Score each section 0-100 based on completeness and quality.
- jobMatching: Score 0-100 for each role based on the candidate's profile fit.

IMPORTANT:
- Extract real data from the resume text. Do not fabricate information.
- If a section is missing from the resume, return an empty array [] for that field.
- Skill scores represent proficiency inferred from context (years, projects, descriptions).
- All scores must be integers between 0 and 100.
- Return ONLY the JSON object. No other text.`;
}
