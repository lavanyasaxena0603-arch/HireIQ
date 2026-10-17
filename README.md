# HireIQ 🤖

**HireIQ** is a futuristic, intelligent hiring platform and Candidate Portal powered by modern web technologies and Artificial Intelligence. It provides seamless authentication, beautiful UI/UX, and an advanced AI-powered resume analyzer to help candidates improve their scores and align with target job descriptions.

## ✨ Features

*   **Next.js 16 (App Router)**: Fast, server-rendered React application for optimal performance and SEO.
*   **AI Resume Analyzer**: Powered by **Google's Gemini 3.6 Flash**. Candidates can upload their resumes in PDF format and get an instant, highly detailed evaluation.
    *   **General Mode**: Generates an overall score, ATS compatibility score, strengths, and areas for improvement.
    *   **Tailored Mode**: Compares the uploaded resume against a specific Job Description and provides a JD Match Score.
*   **In-Browser PDF Extraction**: Uses `pdfjs-dist` to securely and privately parse PDF text on the client side before securely sending it to the backend for AI evaluation.
*   **Supabase Authentication**: Secure Candidate portal login via **Google OAuth** and standard Email/Password authentication.
*   **Analysis History**: Securely tracks and saves all past resume evaluations in a Supabase PostgreSQL database via Row Level Security (RLS). 
*   **Stunning UI/UX**: Features a custom dark-mode futuristic AI theme, neon gradients, glassmorphism, responsive navigation, and Font Awesome icons.

## 🚀 Getting Started

Follow these steps to set up and run the AI Recruiter project locally on your machine.

### 1. Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   A [Supabase](https://supabase.com/) Account (Free tier is perfect)
*   A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 2. Clone the Repository
```bash
git clone https://github.com/lavanyasaxena0603-arch/ATS.git
cd ATS
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a new file named `.env.local` in the root of the project and add your API keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Set up Supabase Database
To enable the History tracking feature, you need to set up the database table. 
1. Go to your Supabase Dashboard.
2. Open the **SQL Editor**.
3. Copy the contents of the `supabase/schema.sql` file from this repository and run it. This will create the `resume_analyses` table and configure the security policies.

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application!

## 🛠️ Tech Stack

*   **Frontend**: Next.js (React), CSS3 (Custom Design System), Font Awesome
*   **Backend**: Next.js API Routes (Node.js)
*   **AI Integration**: `@google/genai` (Gemini 3.6 Flash)
*   **Database & Auth**: Supabase (PostgreSQL, GoTrue)
*   **Utilities**: `pdfjs-dist` (PDF Parsing)

## 🤝 Developed By
*   Lavanya Saxena
*   Gaurank Verma
