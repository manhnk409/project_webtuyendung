import React, { useState } from 'react';
import { login } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [status, setStatus] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await login(form);
      setStatus(JSON.stringify(res));
    } catch (err) {
      setStatus('Error: ' + (err.message || err));
    }
  };

  return (
    <div style={{padding: '1rem'}}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{display: 'grid', gap: '0.5rem', maxWidth: 320}}>
        <input name="username" placeholder="Username" value={form.username} onChange={onChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} />
        <button type="submit">Login</button>
      </form>
      {status && <pre style={{marginTop: '1rem'}}>{status}</pre>}
    </div>
  );
}
