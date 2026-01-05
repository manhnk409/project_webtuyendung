import React, { useState } from 'react';
import { changeEmployerPassword, getUserMe, updateUserMe } from '../services/api';

export default function Settings() {
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [status, setStatus] = useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const user = await getUserMe();
        if (user && user.email) setEmailForm({ email: user.email });
      } catch (e) {}
    })();
  }, []);

  const onChange = (setter) => (e) => setter((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submitPassword = async (e) => {
    e.preventDefault();
    setStatus('changing password...');
    try {
      const res = await changeEmployerPassword(passForm);
      setStatus(JSON.stringify(res));
      setPassForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setStatus('Error: ' + (err.message || err));
    }
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    setStatus('updating email...');
    try {
      const res = await updateUserMe({ email: emailForm.email });
      setStatus(JSON.stringify(res));
    } catch (err) {
      setStatus('Error: ' + (err.message || err));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Settings</h2>

      <section style={{ marginTop: 12 }}>
        <h3>Change Password</h3>
        <form onSubmit={submitPassword} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
          <input name="currentPassword" type="password" placeholder="Current password" value={passForm.currentPassword} onChange={onChange(setPassForm)} />
          <input name="newPassword" type="password" placeholder="New password" value={passForm.newPassword} onChange={onChange(setPassForm)} />
          <button type="submit">Change password</button>
        </form>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Change Email</h3>
        <form onSubmit={submitEmail} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
          <input name="email" placeholder="Email" value={emailForm.email} onChange={onChange(setEmailForm)} />
          <button type="submit">Update email</button>
        </form>
      </section>

      {status && <pre style={{ marginTop: 12 }}>{status}</pre>}
    </div>
  );
}
