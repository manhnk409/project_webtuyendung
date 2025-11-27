import React from 'react';

export default function Header() {
  return (
    <header style={{padding: '1rem', borderBottom: '1px solid #eee'}}>
      <nav style={{display: 'flex', gap: '1rem'}}>
        <a href="/">Home</a>
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      </nav>
    </header>
  );
}
