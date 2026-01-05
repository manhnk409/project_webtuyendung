import React, { useState, useEffect } from 'react';
import './candidate.css';
import { getCandidateMe, updateCandidateMe, getOpenJobs, applyToJob, getCandidateApplications, deleteApplication } from '../services/api';

function QuickStat({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function CandidateDashboard() {
  const [panel, setPanel] = useState('overview');
  let name = 'Ứng viên';
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
          <li className={panel === 'available' ? 'active' : ''} onClick={() => setPanel('available')}>Việc làm hiện có</li>
          <li className={panel === 'applied' ? 'active' : ''} onClick={() => setPanel('applied')}>Việc đã ứng tuyển</li>
          <li className={panel === 'profile' ? 'active' : ''} onClick={() => setPanel('profile')}>Hồ sơ cá nhân</li>
          <li className={panel === 'settings' ? 'active' : ''} onClick={() => setPanel('settings')}>Cài đặt</li>
        </ul>
      </aside>

      <main className="candidate-main">
        {panel === 'overview' && (
          <div className="overview">
            <h2>Xin chào, {name}!</h2>

            <section className="quick-stats">
              <QuickStat label="Việc đã ứng tuyển" value={5} />
              <QuickStat label="Nhà tuyển dụng đã xem hồ sơ bạn" value={12} />
              <QuickStat label="Việc được gợi ý" value={8} />
              <QuickStat label="Lời mời phỏng vấn" value={3} />
            </section>

            <section className="panel-card">
              <h3>Công việc phù hợp với bạn</h3>
              <ul className="job-list">
                <li>Frontend Intern • HCM</li>
                <li>QA Tester • Remote</li>
                <li>NodeJS Developer • Hà Nội</li>
              </ul>
            </section>

            <section className="panel-card">
              <h3>Việc làm đã ứng tuyển gần đây</h3>
              <ul className="applied-list">
                <li>UI/UX Designer • Trạng thái: Đã xem</li>
                <li>Sales Executive • Đang chờ phản hồi</li>
                <li>Data Analyst • Đã từ chối</li>
              </ul>
            </section>
          </div>
        )}

        {panel === 'available' && <AvailableJobs />}
        {panel === 'applied' && <AppliedJobs />}
        {panel === 'profile' && (
          <div className="profile-panel">
            <h3>Hồ sơ cá nhân</h3>
            <ProfileView />
          </div>
        )}
        {panel === 'settings' && <div style={{padding:20}}>Cài đặt (placeholder)</div>}
      </main>
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
          <div className="profile-row"><strong>Họ và tên:</strong> {profile?.full_name || '-'}</div>
          <div className="profile-row"><strong>Ngày sinh:</strong> {profile?.date_of_birth || '-'}</div>
          <div className="profile-row"><strong>Số điện thoại:</strong> {profile?.phone_number || '-'}</div>
          <div className="profile-row"><strong>Resume:</strong> {profile?.resume_url ? <a href={profile.resume_url} target="_blank" rel="noreferrer">Link</a> : '-'}</div>
          <div className="profile-row"><strong>Kỹ năng:</strong> {profile?.skills || '-'}</div>
          <div style={{marginTop:10}}>
            <button onClick={() => setEditing(true)}>Chỉnh sửa</button>
          </div>
        </div>
      )}

      {editing && (
        <div className="profile-edit">
          <label>Họ và tên</label>
          <input name="full_name" value={form.full_name} onChange={onChange} />
          <label>Ngày sinh</label>
          <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={onChange} />
          <label>Số điện thoại</label>
          <input name="phone_number" value={form.phone_number} onChange={onChange} />
          <label>Resume URL</label>
          <input name="resume_url" value={form.resume_url} onChange={onChange} />
          <label>Kỹ năng</label>
          <textarea name="skills" value={form.skills} onChange={onChange} />

          <div style={{marginTop:10}}>
            <button onClick={onSave} disabled={loading}>Lưu</button>
            <button onClick={() => { setEditing(false); setForm({ full_name: profile?.full_name||'', date_of_birth: profile?.date_of_birth||'', phone_number: profile?.phone_number||'', resume_url: profile?.resume_url||'', skills: profile?.skills||'' }); }} style={{marginLeft:8}}>Hủy</button>
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
        setMessage('Ứng tuyển thành công.');
      }
    } catch (err) {
      console.error('apply failed', err);
      setMessage('Ứng tuyển thất bại, thử lại sau.');
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) return <div style={{padding:20}}>Đang tải...</div>;

  return (
    <div style={{padding:20}}>
      <h2>Việc làm hiện có</h2>
      {message && <div style={{margin:'8px 0', color:'#0a6', fontWeight:600}}>{message}</div>}
      {jobs.length === 0 && <p>Chưa có việc làm nào đang mở.</p>}
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
                {applyingId === job.job_id ? 'Đang gửi...' : 'Ứng tuyển'}
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
          setError('Không tìm thấy thông tin ứng viên');
          return;
        }

        const data = await getCandidateApplications(userId);
        const list = Array.isArray(data) ? data : (data?.data || data?.applications || []);
        setApplications(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load applications', err);
        setError('Không thể tải danh sách ứng tuyển');
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
      setError('Hủy ứng tuyển thất bại');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div style={{padding:20}}>Đang tải...</div>;
  if (error) return <div style={{padding:20, color:'#d00'}}>{error}</div>;

  const statusMap = {
    pending: 'Đang chờ',
    reviewed: 'Đã xem',
    accepted: 'Chấp nhận',
    rejected: 'Từ chối'
  };

  return (
    <div style={{padding:20}}>
      <h2>Việc làm đã ứng tuyển</h2>
      {applications.length === 0 && <p>Bạn chưa ứng tuyển công việc nào.</p>}
      {applications.length > 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          {applications.map(app => (
            <div key={app.application_id} style={{background:'#fff', border:'1px solid #e6e6e6', padding:'12px', borderRadius:'6px'}}>
              <h3 style={{margin:'0 0 8px 0', fontSize:'1.1rem'}}>{app.title || app.job_title || app.jobTitle || app.job_name || 'N/A'}</h3>
              <div style={{marginTop:'8px', fontSize:'0.9rem', color:'#555'}}>
                <div><strong>Trạng thái:</strong> <span style={{color: app.status === 'accepted' ? '#0a6' : app.status === 'rejected' ? '#d00' : '#f80'}}>{statusMap[app.status] || app.status}</span></div>
                <div><strong>Ngày ứng tuyển:</strong> {app.applied_at ? new Date(app.applied_at).toLocaleDateString('vi-VN') : 'N/A'}</div>
                {app.cover_letter && <div style={{marginTop:'8px'}}><strong>Thư xin việc:</strong> {app.cover_letter}</div>}
              </div>
              <div style={{marginTop:'10px', display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center', alignItems:'center'}}>
                <button
                  style={{padding:'6px 10px', border:'1px solid #ccc', background:'#fafafa', cursor:'pointer'}}
                  onClick={() => setExpandedId(expandedId === app.application_id ? null : app.application_id)}
                >
                  {expandedId === app.application_id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                </button>
                <button
                  style={{padding:'6px 10px', border:'1px solid #e33', background:'#ffecec', color:'#b00', cursor:'pointer', opacity: cancellingId === app.application_id ? 0.7 : 1}}
                  disabled={cancellingId === app.application_id}
                  onClick={() => handleCancel(app.application_id)}
                >
                  {cancellingId === app.application_id ? 'Đang hủy...' : 'Hủy ứng tuyển'}
                </button>
              </div>
              {expandedId === app.application_id && (
                <div style={{marginTop:'10px', fontSize:'0.9rem', color:'#444', lineHeight:1.5}}>
                  <div><strong>Mô tả:</strong> {app.description || 'Không có mô tả'}</div>
                  <div><strong>Địa điểm:</strong> {app.location || 'Không rõ'}</div>
                  <div><strong>Mức lương:</strong> {app.salary_range || 'Không rõ'}</div>
                  <div><strong>Trạng thái job:</strong> {app.job_status || 'Không rõ'}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
