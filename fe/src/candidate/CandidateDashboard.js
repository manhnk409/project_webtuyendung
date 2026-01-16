import React, { useState, useEffect } from 'react';
import './candidate.css';
import { getCandidateMe, updateCandidateMe, getOpenJobs, searchJobs, applyToJob, getCandidateApplications, deleteApplication, changeCandidatePassword } from '../services/api';
import JobSearchFilter from './JobSearchFilter';

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
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ margin: '0 0 1.5rem 0', fontSize: '2rem', color: '#2c3e50' }}>Settings</h1>
      
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', color: '#2c3e50', borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem' }}>
          🔐 Change Password
        </h2>

        {message.text && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            background: message.type === 'error' ? '#fee' : '#efe',
            color: message.type === 'error' ? '#c33' : '#0a6',
            border: `2px solid ${message.type === 'error' ? '#fcc' : '#cfc'}`,
            fontWeight: 500
          }}>
            {message.type === 'error' ? '❌' : '✅'} {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '0.95rem'
            }}>
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
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
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '0.95rem'
            }}>
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password"
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
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '0.95rem'
            }}>
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
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

  if (loading && !profile) return <div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ margin: '0 0 1.5rem 0', fontSize: '2rem', color: '#2c3e50' }}>Personal Profile</h1>

      {!editing && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'grid',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Name</label>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50', fontWeight: 500 }}>{profile?.full_name || '-'}</p>
            </div>

            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Date of Birth</label>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50', fontWeight: 500 }}>{profile?.date_of_birth || '-'}</p>
            </div>

            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number</label>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50', fontWeight: 500 }}>{profile?.phone_number || '-'}</p>
            </div>

            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Resume</label>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50', fontWeight: 500 }}>
                {profile?.resume_url ? <a href={profile.resume_url} target="_blank" rel="noreferrer" style={{color: '#3498db', textDecoration: 'none', fontWeight: 600}}>📄 View Resume</a> : '-'}
              </p>
            </div>

            <div style={{ paddingBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Skills</label>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{profile?.skills || '-'}</p>
            </div>
          </div>

          <button
            onClick={() => setEditing(true)}
            style={{
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

      {editing && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '0.95rem'
            }}>Full Name</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={onChange}
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
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '0.95rem'
            }}>Date of Birth</label>
            <input
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={onChange}
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
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '0.95rem'
            }}>Phone Number</label>
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={onChange}
              placeholder="Enter your phone number"
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
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '0.95rem'
            }}>Resume URL</label>
            <input
              name="resume_url"
              value={form.resume_url}
              onChange={onChange}
              placeholder="https://example.com/resume.pdf"
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
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '0.95rem'
            }}>Skills</label>
            <textarea
              name="skills"
              value={form.skills}
              onChange={onChange}
              placeholder="Enter your skills (comma-separated or one per line)"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #dee2e6',
                borderRadius: '6px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'all 0.3s',
                boxSizing: 'border-box',
                minHeight: '100px',
                resize: 'vertical'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={onSave}
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
              onClick={() => {
                setEditing(false);
                setForm({
                  full_name: profile?.full_name || '',
                  date_of_birth: profile?.date_of_birth || '',
                  phone_number: profile?.phone_number || '',
                  resume_url: profile?.resume_url || '',
                  skills: profile?.skills || ''
                });
              }}
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

function AvailableJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [message, setMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAllJobs = async () => {
    setLoading(true);
    try {
      const data = await getOpenJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load open jobs', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllJobs();
  }, []);

  const handleSearch = async (filters) => {
    setHasSearched(true);
    setLoading(true);
    try {
      // If all filters are empty, load all jobs
      if (!filters.keyword && !filters.location && !filters.salaryMin && !filters.salaryMax) {
        await loadAllJobs();
      } else {
        const data = await searchJobs(filters);
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to search jobs', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job_id) => {
    setSelectedJob(jobs.find(j => j.job_id === job_id));
    setCoverLetter('');
    setShowCoverLetterModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedJob) return;
    
    setIsSubmitting(true);
    setMessage('');
    try {
      const res = await applyToJob({ job_id: selectedJob.job_id, cover_letter: coverLetter });
      if (res && res.error) {
        setMessage(res.error);
      } else {
        setMessage('Application submitted successfully.');
        setShowCoverLetterModal(false);
        setCoverLetter('');
        setSelectedJob(null);
      }
    } catch (err) {
      console.error('apply failed', err);
      setMessage('Application failed, please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseCoverLetterModal = () => {
    setShowCoverLetterModal(false);
    setCoverLetter('');
    setSelectedJob(null);
  };

  if (loading && !hasSearched) return <div style={{padding:20}}>Loading...</div>;

  return (
    <div style={{padding:20}}>
      <h2>Available Jobs</h2>
      <JobSearchFilter onSearch={handleSearch} />
      {message && <div style={{margin:'8px 0', color:'#0a6', fontWeight:600}}>{message}</div>}
      {jobs.length === 0 && <p>{hasSearched ? 'No jobs found matching your search.' : 'No jobs are currently open.'}</p>}
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
                style={{marginTop:'10px', padding:'6px 12px', background:'#007bff', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer'}}
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Cover Letter Modal */}
      {showCoverLetterModal && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{margin: '0 0 1rem 0', color: '#2c3e50'}}>Write Your Cover Letter</h2>
            <p style={{color: '#555', marginBottom: '1rem'}}>Position: <strong>{selectedJob.title}</strong></p>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                Cover Letter
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write your cover letter here... (Optional)"
                style={{
                  width: '100%',
                  minHeight: '250px',
                  padding: '1rem',
                  border: '2px solid #dee2e6',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3498db'}
                onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCloseCoverLetterModal}
                disabled={isSubmitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={isSubmitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: isSubmitting ? '#95a5a6' : '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
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
