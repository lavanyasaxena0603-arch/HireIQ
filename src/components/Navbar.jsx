"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { usePathname } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let supabase = null;
try {
  if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (e) {
  console.warn("Supabase not initialized properly");
}

export default function Navbar() {
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => subscription.unsubscribe();
  }, []);

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0];
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initial = name ? name.charAt(0).toUpperCase() : '';

  return (
    <nav className="navbar">
      <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
        <i className="fas fa-layer-group"></i>
        <span>HireIQ</span>
      </Link>
      
      <div className="nav-links">
        <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
        <Link href="/apply" className={pathname === '/apply' ? 'active' : ''}>Apply</Link>
        <Link href="/recruiter" className={pathname === '/recruiter' ? 'active' : ''}>Recruiter</Link>
        
        <Link href="/candidate" style={{ marginLeft: '12px', textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-primary)', padding: '6px 16px 6px 6px',
            borderRadius: '100px', border: '1px solid var(--border)'
          }}>
            {user ? (
              <>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                    {initial}
                  </div>
                )}
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>{name}</span>
              </>
            ) : (
              <span style={{ color: 'var(--primary)', fontWeight: 700, padding: '4px 12px', fontSize: '14px' }}>
                Sign In
              </span>
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
}
