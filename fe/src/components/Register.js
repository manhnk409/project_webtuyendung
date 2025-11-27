import React, { useState } from 'react';
import { register } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [status, setStatus] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await register(form);
      setStatus(JSON.stringify(res));
    } catch (err) {
      setStatus('Error: ' + (err.message || err));
    }
  };

  return (
    <div style={{padding: '1rem'}}>
      <h2>Register</h2>
      <form onSubmit={onSubmit} style={{display: 'grid', gap: '0.5rem', maxWidth: 320}}>
        <input name="username" placeholder="Username" value={form.username} onChange={onChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} />
        <button type="submit">Register</button>
      </form>
      {status && <pre style={{marginTop: '1rem'}}>{status}</pre>}
    </div>
  );
}
