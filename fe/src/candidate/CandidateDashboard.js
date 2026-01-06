import React, { useState, useEffect } from 'react';
import './candidate.css';
import { getCandidateMe, updateCandidateMe, getOpenJobs, applyToJob, getCandidateApplications, deleteApplication, changeCandidatePassword } from '../services/api';

function QuickStat({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function CandidateDashboard({ forceProfileEdit }) {
  const [panel, setPanel] = useState(forceProfileEdit ? 'profile' : 'overview');
  
  React.useEffect(() => {
    if (forceProfileEdit) {
      setPanel('profile');
    }
  }, [forceProfileEdit]);
  
  let name = 'Candidate';
  try {
    const raw = localStorage.getItem('auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user && parsed.user.name) name = parsed.user.name;
      else if (parsed && parsed.user && parsed.user.username) name = parsed.user.username;
    }
  } catch (e) {
    // ignore
  }

  return (
    <div className="candidate-dashboard">
      <aside className="candidate-sidebar">
        <h3>Candidate</h3>
        <ul>
          <li className={panel === 'overview' ? 'active' : ''} onClick={() => setPanel('overview')}>Dashboard</li>
          <li className={panel === 'available' ? 'active' : ''} onClick={() => setPanel('available')}>Available Jobs</li>
          <li className={panel === 'applied' ? 'active' : ''} onClick={() => setPanel('applied')}>Applied Jobs</li>
          <li className={panel === 'profile' ? 'active' : ''} onClick={() => setPanel('profile')}>Profile</li>
          <li className={panel === 'settings' ? 'active' : ''} onClick={() => setPanel('settings')}>Settings</li>
        </ul>
      </aside>

      <main className="candidate-main">
        {panel === 'overview' && (
          <div className="overview">
            <h2>Hello, {name}!</h2>

            <section className="quick-stats">
              <QuickStat label="Applications Submitted" value={5} />
              <QuickStat label="Profile Views" value={12} />
              <QuickStat label="Recommended Jobs" value={8} />
              <QuickStat label="Interview Invitations" value={3} />
            </section>

            <section className="panel-card">
              <h3>Jobs Matching Your Profile</h3>
              <ul className="job-list">
                <li>Frontend Intern • HCM</li>
                <li>QA Tester • Remote</li>
                <li>NodeJS Developer • Hanoi</li>
              </ul>
            </section>

            <section className="panel-card">
              <h3>Recent Applications</h3>
              <ul className="applied-list">
                <li>UI/UX Designer • Status: Reviewed</li>
                <li>Sales Executive • Pending Response</li>
                <li>Data Analyst • Rejected</li>
              </ul>
            </section>
          </div>
        )}

        {panel === 'available' && <AvailableJobs />}
        {panel === 'applied' && <AppliedJobs />}
        {panel === 'profile' && (
          <div className="profile-panel">
            <h3>Personal Profile</h3>
            <ProfileView />
          </div>
        )}
        {panel === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}

function SettingsPanel() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match' });
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      const { changeCandidatePassword } = await import('../services/api');
      const result = await changeCandidatePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      if (result && result.error) {
        setMessage({ type: 'error', text: result.error || 'Failed to change password' });
      } else if (result && result.message) {
        setMessage({ type: 'success', text: result.message });
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error('Change password error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h2>Settings</h2>
      <div style={{ marginTop: 20, background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e6e6e6' }}>
        <h3 style={{ marginTop: 0 }}>Change Password</h3>
        {message.text && (
          <div style={{
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '4px',
            background: message.type === 'error' ? '#fee' : '#efe',
            color: message.type === 'error' ? '#c00' : '#0a6',
            border: `1px solid ${message.type === 'error' ? '#fcc' : '#cfc'}`
          }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              disabled={loading}
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              disabled={loading}
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 500 }}>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#ccc' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500
            }}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', date_of_birth: '', phone_number: '', resume_url: '', skills: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCandidateMe();
      setProfile(res || null);
      if (res) setForm({
        full_name: res.full_name || res.fullName || '',
        date_of_birth: res.date_of_birth || res.dateOfBirth || '',
        phone_number: res.phone_number || res.phoneNumber || '',
        resume_url: res.resume_url || res.resumeUrl || '',
        skills: res.skills || ''
      });
    } catch (err) {
      console.error('load profile failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async () => {
    setLoading(true);
    try {
      const payload = { ...form };
      const res = await updateCandidateMe(payload);
      if (res) {
        setProfile(res);
        setEditing(false);
        await load();
      }
    } catch (err) {
      console.error('save profile failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return <div>Loading...</div>;

  return (
    <div className="profile-root">
      {!editing && (
        <div className="profile-display">
          <div className="profile-row"><strong>Full Name:</strong> {profile?.full_name || '-'}</div>
          <div className="profile-row"><strong>Date of Birth:</strong> {profile?.date_of_birth || '-'}</div>
          <div className="profile-row"><strong>Phone Number:</strong> {profile?.phone_number || '-'}</div>
          <div className="profile-row"><strong>Resume:</strong> {profile?.resume_url ? <a href={profile.resume_url} target="_blank" rel="noreferrer">Link</a> : '-'}</div>
          <div className="profile-row"><strong>Skills:</strong> {profile?.skills || '-'}</div>
          <div style={{marginTop:10}}>
            <button onClick={() => setEditing(true)}>Edit</button>
          </div>
        </div>
      )}

      {editing && (
        <div className="profile-edit">
          <label>Full Name</label>
          <input name="full_name" value={form.full_name} onChange={onChange} />
          <label>Date of Birth</label>
          <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={onChange} />
          <label>Phone Number</label>
          <input name="phone_number" value={form.phone_number} onChange={onChange} />
          <label>Resume URL</label>
          <input name="resume_url" value={form.resume_url} onChange={onChange} />
          <label>Skills</label>
          <textarea name="skills" value={form.skills} onChange={onChange} />

          <div style={{marginTop:10}}>
            <button onClick={onSave} disabled={loading}>Save</button>
            <button onClick={() => { setEditing(false); setForm({ full_name: profile?.full_name||'', date_of_birth: profile?.date_of_birth||'', phone_number: profile?.phone_number||'', resume_url: profile?.resume_url||'', skills: profile?.skills||'' }); }} style={{marginLeft:8}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AvailableJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const data = await getOpenJobs();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load open jobs', err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const handleApply = async (job_id) => {
    setApplyingId(job_id);
    setMessage('');
    try {
      const res = await applyToJob({ job_id, cover_letter: '' });
      if (res && res.error) {
        setMessage(res.error);
      } else {
        setMessage('Application submitted successfully.');
      }
    } catch (err) {
      console.error('apply failed', err);
      setMessage('Application failed, please try again later.');
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) return <div style={{padding:20}}>Loading...</div>;

  return (
    <div style={{padding:20}}>
      <h2>Available Jobs</h2>
      {message && <div style={{margin:'8px 0', color:'#0a6', fontWeight:600}}>{message}</div>}
      {jobs.length === 0 && <p>No jobs are currently open.</p>}
      {jobs.length > 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          {jobs.map(job => (
            <div key={job.job_id} style={{background:'#fff', border:'1px solid #e6e6e6', padding:'12px', borderRadius:'6px'}}>
              <h3 style={{margin:'0 0 8px 0', fontSize:'1.1rem'}}>{job.title}</h3>
              <p style={{margin:'4px 0', color:'#555', fontSize:'0.9rem'}}>{job.description}</p>
              <div style={{marginTop:'8px', fontSize:'0.85rem', color:'#777'}}>
                <span>📍 {job.location || 'N/A'}</span>
                {job.salary_range && <span style={{marginLeft:'16px'}}>💰 {job.salary_range}</span>}
              </div>
              <button
                onClick={() => handleApply(job.job_id)}
                disabled={applyingId === job.job_id}
                style={{marginTop:'10px', padding:'6px 12px', background:'#007bff', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer', opacity: applyingId === job.job_id ? 0.7 : 1}}
              >
                {applyingId === job.job_id ? 'Submitting...' : 'Apply'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AppliedJobs() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      setError('');
      try {
        // Get user_id from auth
        const tokenRaw = localStorage.getItem('auth');
        let userId = null;
        if (tokenRaw) {
          const parsed = JSON.parse(tokenRaw);
          if (parsed) {
            // Try multiple ways to get user_id
            userId = parsed.id || parsed.user_id || parsed.userId ||
                     (parsed.user && (parsed.user.id || parsed.user.user_id || parsed.user.userId));
          }
        }

        if (!userId) {
          setError('Candidate information not found');
          return;
        }

        const data = await getCandidateApplications(userId);
        const list = Array.isArray(data) ? data : (data?.data || data?.applications || []);
        setApplications(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load applications', err);
        setError('Unable to load application list');
      } finally {
        setLoading(false);
      }
    };
    loadApplications();
  }, []);

  const handleCancel = async (applicationId) => {
    setCancellingId(applicationId);
    setError('');
    try {
      const res = await deleteApplication(applicationId);
      if (res && res.error) {
        setError(res.error);
      } else {
        setApplications(prev => prev.filter(a => a.application_id !== applicationId));
      }
    } catch (err) {
      console.error('Failed to cancel application', err);
      setError('Failed to cancel application');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div style={{padding:20}}>Loading...</div>;
  if (error) return <div style={{padding:20, color:'#d00'}}>{error}</div>;

  const statusMap = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    accepted: 'Accepted',
    rejected: 'Rejected'
  };

  return (
    <div style={{padding:20}}>
      <h2>Applied Jobs</h2>
      {applications.length === 0 && <p>You haven't applied to any jobs yet.</p>}
      {applications.length > 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          {applications.map(app => (
            <div key={app.application_id} style={{background:'#fff', border:'1px solid #e6e6e6', padding:'12px', borderRadius:'6px'}}>
              <h3 style={{margin:'0 0 8px 0', fontSize:'1.1rem'}}>{app.title || app.job_title || app.jobTitle || app.job_name || 'N/A'}</h3>
              <div style={{marginTop:'8px', fontSize:'0.9rem', color:'#555'}}>
                <div><strong>Status:</strong> <span style={{color: app.status === 'accepted' ? '#0a6' : app.status === 'rejected' ? '#d00' : '#f80'}}>{statusMap[app.status] || app.status}</span></div>
                <div><strong>Applied Date:</strong> {app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-US') : 'N/A'}</div>
                {app.cover_letter && <div style={{marginTop:'8px'}}><strong>Cover Letter:</strong> {app.cover_letter}</div>}
              </div>
              <div style={{marginTop:'10px', display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center', alignItems:'center'}}>
                <button
                  style={{padding:'6px 10px', border:'1px solid #ccc', background:'#fafafa', cursor:'pointer'}}
                  onClick={() => setExpandedId(expandedId === app.application_id ? null : app.application_id)}
                >
                  {expandedId === app.application_id ? 'Hide Details' : 'View Details'}
                </button>
                <button
                  style={{padding:'6px 10px', border:'1px solid #e33', background:'#ffecec', color:'#b00', cursor:'pointer', opacity: cancellingId === app.application_id ? 0.7 : 1}}
                  disabled={cancellingId === app.application_id}
                  onClick={() => handleCancel(app.application_id)}
                >
                  {cancellingId === app.application_id ? 'Cancelling...' : 'Cancel Application'}
                </button>
              </div>
              {expandedId === app.application_id && (
                <div style={{marginTop:'10px', fontSize:'0.9rem', color:'#444', lineHeight:1.5}}>
                  <div><strong>Description:</strong> {app.description || 'No description'}</div>
                  <div><strong>Location:</strong> {app.location || 'Not specified'}</div>
                  <div><strong>Salary Range:</strong> {app.salary_range || 'Not specified'}</div>
                  <div><strong>Job Status:</strong> {app.job_status || 'Not specified'}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
