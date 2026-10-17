import { GoogleGenAI } from '@google/genai';
import { buildResumeAnalysisPrompt } from '@/lib/nlpPrompt';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { resumeText, jobDescription, mode } = await req.json();

    if (!resumeText || resumeText.trim().length < 50) {
      return Response.json(
        { error: 'Resume text is too short or empty. Please provide a valid resume.' },
        { status: 400 }
      );
    }

    const prompt = buildResumeAnalysisPrompt(resumeText, jobDescription, mode || 'general');

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    });

    const rawText = result.text?.trim() || '';

    // Strip any markdown code fences if model adds them
    const jsonText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error. Raw output:', rawText.substring(0, 500));
      return Response.json(
        { error: 'AI response could not be parsed. Please try again.' },
        { status: 500 }
      );
    }

    return Response.json({ success: true, data: parsed });
  } catch (err) {
    console.error('/api/analyze error:', err);
    return Response.json(
      { error: err.message || 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
