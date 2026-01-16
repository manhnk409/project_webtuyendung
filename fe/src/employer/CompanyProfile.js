import React, { useEffect, useState } from 'react';
import { getEmployerMe, updateEmployerMe } from '../services/api';
export default function CompanyProfile() {
  const [employer, setEmployer] = useState(null);
  const [status, setStatus] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempData, setTempData] = useState(null);

  const fetchEmployer = async () => {
    setLoading(true);
    try {
      const epl = await getEmployerMe();
      setEmployer(epl);
      setStatus(null);
      return epl;
    } catch (e) {
      console.error('Failed to load employer:', e);
      setStatus('Failed to load employer');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployer();
  }, []);

  const startEdit = () => {
    setTempData({ ...employer });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setTempData(null);
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setTempData((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const payload = {
        employer_name: tempData.employer_name,
        employer_email: tempData.employer_email,
        contact_number: tempData.contact_number,
        company_name: tempData.company_name,
        company_address: tempData.company_address,
        company_website: tempData.company_website,
      };

      await updateEmployerMe(payload);
      const fresh = await fetchEmployer();
      setEmployer(fresh || tempData);
      setEditing(false);
      setTempData(null);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Error: ' + (err?.message || err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#2c3e50' }}>Company Profile</h1>
        <button
          onClick={fetchEmployer}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            background: loading ? '#95a5a6' : '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

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
          {status.type === 'error' ? '❌' : '✅'} {status.message}
        </div>
      )}

      {!editing && employer && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', color: '#2c3e50', borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem' }}>
            👤 Personal Information
          </h2>

          <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Name</label>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50', fontWeight: 500 }}>{employer?.employer_name || '-'}</p>
            </div>

            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email</label>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50', fontWeight: 500 }}>{employer?.employer_email || '-'}</p>
            </div>

            <div style={{ paddingBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Contact Number</label>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50', fontWeight: 500 }}>{employer?.contact_number || '-'}</p>
            </div>
          </div>

          <h2 style={{ margin: '2rem 0 1.5rem 0', fontSize: '1.3rem', color: '#2c3e50', borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem' }}>
            🏢 Company Information
          </h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Company Name</label>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50', fontWeight: 500 }}>{employer?.company_name || '-'}</p>
            </div>

            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Address</label>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50', fontWeight: 500 }}>{employer?.company_address || '-'}</p>
            </div>

            <div style={{ paddingBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Website</label>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50', fontWeight: 500 }}>
                {employer?.company_website ? <a href={employer.company_website} target="_blank" rel="noreferrer" style={{color: '#3498db', textDecoration: 'none', fontWeight: 600}}>🔗 {employer.company_website}</a> : '-'}
              </p>
            </div>
          </div>

          <button
            onClick={startEdit}
            style={{
              marginTop: '2rem',
              width: '100%',
              padding: '0.9rem',
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
            }}
            onMouseOver={(e) => e.target.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)'}
            onMouseOut={(e) => e.target.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)'}
          >
            ✏️ Edit Profile
          </button>
        </div>
      )}

      {editing && tempData && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', color: '#2c3e50', borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem' }}>
            ✏️ Edit Profile
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>Full Name</label>
            <input
              name="employer_name"
              value={tempData.employer_name || ''}
              onChange={onInputChange}
              placeholder="Enter your full name"
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>Email</label>
            <input
              name="employer_email"
              type="email"
              value={tempData.employer_email || ''}
              onChange={onInputChange}
              placeholder="Enter your email"
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>Contact Number</label>
            <input
              name="contact_number"
              value={tempData.contact_number || ''}
              onChange={onInputChange}
              placeholder="Enter your contact number"
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>Company Name</label>
            <input
              name="company_name"
              value={tempData.company_name || ''}
              onChange={onInputChange}
              placeholder="Enter your company name"
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>Address</label>
            <input
              name="company_address"
              value={tempData.company_address || ''}
              onChange={onInputChange}
              placeholder="Enter your company address"
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>Website</label>
            <input
              name="company_website"
              value={tempData.company_website || ''}
              onChange={onInputChange}
              placeholder="https://example.com"
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

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={saveChanges}
              disabled={loading}
              style={{
                flex: 1,
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
              {loading ? '💾 Saving...' : '💾 Save Changes'}
            </button>

            <button
              onClick={cancelEdit}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.9rem',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(149, 165, 166, 0.3)'
              }}
              onMouseOver={(e) => e.target.style.boxShadow = '0 6px 20px rgba(149, 165, 166, 0.4)'}
              onMouseOut={(e) => e.target.style.boxShadow = '0 4px 15px rgba(149, 165, 166, 0.3)'}
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}