import React, { useState } from 'react';
import { register } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'candidate' });
  const [status, setStatus] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await register({ username: form.username, password: form.password, email: form.email, role: form.role });
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
        <label style={{fontSize:12}}>Register as:</label>
        <select name="role" value={form.role} onChange={onChange}>
          <option value="candidate">Candidate</option>
          <option value="employer">Employer</option>
        </select>
        <button type="submit">Register</button>
      </form>
      {status && <pre style={{marginTop: '1rem'}}>{status}</pre>}
    </div>
  );
}
