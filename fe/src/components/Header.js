import React from 'react';

export default function Header({ onNavigate, auth, onLogout }) {
  const nav = (e, route) => {
    e && e.preventDefault();
    if (onNavigate) onNavigate(route);
  };

  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
      <nav style={{ display: 'flex', gap: '1rem' }}>
        {!auth && (
          <>
            <a href="#" onClick={(e) => nav(e, 'login')}>Login</a>
            <a href="#" onClick={(e) => nav(e, 'register')}>Register</a>
          </>
        )}

        {auth && auth.user && auth.user.role === 'employer' && (
          <>
            <a href="#" onClick={(e) => nav(e, 'employer')}>Employer</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onLogout && onLogout(); }}>Logout</a>
          </>
        )}

        {auth && auth.user && auth.user.role === 'candidate' && (
          <>
            <a href="#" onClick={(e) => nav(e, 'candidate')}>Candidate</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onLogout && onLogout(); }}>Logout</a>
          </>
        )}

        {auth && auth.user && auth.user.role === 'admin' && (
          <>
            <a href="#" onClick={(e) => nav(e, 'admin')}>Admin</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onLogout && onLogout(); }}>Logout</a>
          </>
        )}

        {/* fallback: if authenticated but role not recognized, just show Logout */}
        {auth && auth.user && !['employer','candidate','admin'].includes(auth.user.role) && (
          <a href="#" onClick={(e) => { e.preventDefault(); onLogout && onLogout(); }}>Logout</a>
        )}
      </nav>
    </header>
  );
}
