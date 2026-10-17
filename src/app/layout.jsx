import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Script from 'next/script';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata = {
  title: 'HireIQ — AI-Powered Hiring Platform',
  description: 'HireIQ: Smart hiring platform with AI resume analysis, NLP extraction, skill gap analysis, and intelligent candidate matching.',
  keywords: 'HireIQ, applicant tracking system, AI resume analysis, NLP, hiring, recruitment, resume parser',
  openGraph: {
    title: 'HireIQ — AI-Powered Hiring Platform',
    description: 'Smart hiring platform with Gemini AI resume intelligence',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            try {
              if (localStorage.theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light')
              }
            } catch (_) {}
          `}
        </Script>
      </head>
      <body>
        <ToastProvider>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
