/**
 * resumeParser.js
 * Unified resume parsing service.
 * Handles PDF and DOCX text extraction client-side.
 */

/**
 * Extract text from a PDF file using pdfjs-dist
 */
export async function extractTextFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const fileUrl = URL.createObjectURL(file);
  try {
    const pdf = await pdfjsLib.getDocument({ url: fileUrl }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ');
      text += pageText + '\n';
    }
    return text.trim();
  } finally {
    URL.revokeObjectURL(fileUrl);
  }
}

/**
 * Extract text from a DOCX file using mammoth
 */
export async function extractTextFromDOCX(file) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Extract text from any supported resume file
 */
export async function extractResumeText(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const mimeType = file.type;

  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return extractTextFromPDF(file);
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    return extractTextFromDOCX(file);
  }

  if (mimeType === 'text/plain' || ext === 'txt') {
    return file.text();
  }

  throw new Error(`Unsupported file type: ${ext}. Please upload PDF, DOCX, or TXT.`);
}

/**
 * Validate a resume file before processing
 */
export function validateResumeFile(file) {
  const maxSizeMB = 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];
  const allowedExts = ['pdf', 'docx', 'txt'];
  const ext = file.name.split('.').pop().toLowerCase();

  if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
    return { valid: false, error: 'Please upload a PDF, DOCX, or TXT file.' };
  }

  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size must be under ${maxSizeMB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.` };
  }

  return { valid: true };
}

/**
 * Get section completion percentage from parsed resume data
 */
export function calculateSectionCompleteness(parsedData) {
  if (!parsedData) return {};
  return {
    contact: parsedData.candidate?.name && parsedData.candidate?.email ? 100 : 
             parsedData.candidate?.name || parsedData.candidate?.email ? 50 : 0,
    summary: parsedData.summary ? 100 : 0,
    experience: parsedData.experience?.length > 0 ? Math.min(100, parsedData.experience.length * 25) : 0,
    education: parsedData.education?.length > 0 ? 100 : 0,
    skills: parsedData.skills?.length > 0 ? Math.min(100, parsedData.skills.length * 10) : 0,
    projects: parsedData.projects?.length > 0 ? Math.min(100, parsedData.projects.length * 33) : 0,
    certifications: parsedData.certifications?.length > 0 ? 100 : 0,
  };
}
