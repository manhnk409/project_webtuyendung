import React, { useState } from 'react';
import { changeEmployerPassword, getUserMe, updateUserMe } from '../services/api';

export default function Settings() {
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [emailForm, setEmailForm] = useState({ email: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const user = await getUserMe();
        if (user && user.email) setEmailForm({ email: user.email });
      } catch (e) {}
    })();
  }, []);

  const onChange = (setter) => (e) => {
    setter((s) => ({ ...s, [e.target.name]: e.target.value }));
    setStatus(null);
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      setStatus({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (passForm.newPassword !== passForm.confirmPassword) {
      setStatus({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passForm.newPassword.length < 6) {
      setStatus({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      const res = await changeEmployerPassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setStatus({ type: 'success', text: res?.message || 'Password changed successfully' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatus({ type: 'error', text: 'Error: ' + (err.message || err) });
    } finally {
      setLoading(false);
    }
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!emailForm.email) {
      setStatus({ type: 'error', text: 'Please enter an email' });
      return;
    }

    setLoading(true);
    try {
      const res = await updateUserMe({ email: emailForm.email });
      setStatus({ type: 'success', text: res?.message || 'Email updated successfully' });
    } catch (err) {
      setStatus({ type: 'error', text: 'Error: ' + (err.message || err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ margin: '0 0 2rem 0', fontSize: '2rem', color: '#2c3e50' }}>Settings</h1>

      {status && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            background: status.type === 'error' ? '#fee' : '#efe',
            color: status.type === 'error' ? '#c33' : '#0a6',
            border: `2px solid ${status.type === 'error' ? '#fcc' : '#cfc'}`,
            fontWeight: 500
          }}
        >
          {status.type === 'error' ? '❌' : '✅'} {status.text}
        </div>
      )}

      {/* Change Password */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', color: '#2c3e50', borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem' }}>
          🔐 Change Password
        </h2>

        <form onSubmit={submitPassword}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              placeholder="Enter your current password"
              value={passForm.currentPassword}
              onChange={onChange(setPassForm)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #dee2e6',
                borderRadius: '6px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'all 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter your new password"
              value={passForm.newPassword}
              onChange={onChange(setPassForm)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #dee2e6',
                borderRadius: '6px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'all 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={passForm.confirmPassword}
              onChange={onChange(setPassForm)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #dee2e6',
                borderRadius: '6px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'all 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: loading ? '#95a5a6' : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(52, 152, 219, 0.3)'
            }}
            onMouseOver={(e) => !loading && (e.target.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)')}
            onMouseOut={(e) => !loading && (e.target.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)')}
          >
            {loading ? 'Changing Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Change Email */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', color: '#2c3e50', borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem' }}>
          📧 Change Email
        </h2>

        <form onSubmit={submitEmail}>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your new email"
              value={emailForm.email}
              onChange={onChange(setEmailForm)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #dee2e6',
                borderRadius: '6px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'all 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: loading ? '#95a5a6' : 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(39, 174, 96, 0.3)'
            }}
            onMouseOver={(e) => !loading && (e.target.style.boxShadow = '0 6px 20px rgba(39, 174, 96, 0.4)')}
            onMouseOut={(e) => !loading && (e.target.style.boxShadow = '0 4px 15px rgba(39, 174, 96, 0.3)')}
          >
            {loading ? 'Updating Email...' : 'Update Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
