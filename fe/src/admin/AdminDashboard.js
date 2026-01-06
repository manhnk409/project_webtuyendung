import React, { useState, useEffect } from 'react';
import { getAllEmployers, getAllCandidates, getMyJobs, getAllUsers, deleteUser } from '../services/api';
import './admin.css';

function StatCard({ icon, count, label, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-count">{count}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [panel, setPanel] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userRes, empRes, candRes, jobRes] = await Promise.all([
        getAllUsers(),
        getAllEmployers(),
        getAllCandidates(),
        getMyJobs()
      ]);

      if (Array.isArray(userRes)) setUsers(userRes);
      if (Array.isArray(empRes)) setEmployers(empRes);
      if (Array.isArray(candRes)) setCandidates(candRes);
      if (Array.isArray(jobRes)) setJobs(jobRes);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.username}" (ID: ${user.user_id})?\n\nThis action cannot be undone and will also delete all related data (employer/candidate profile, jobs, applications, etc.).`
    );
    
    if (!confirmed) return;
    
    try {
      setLoading(true);
      await deleteUser(user.user_id);
      alert('User deleted successfully');
      await loadData();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const jobList = [
    { title: 'Software Engineer', employer: 'Tech Corp', location: 'New York', status: 'open' },
    { title: 'Data Scientist', employer: 'Data Innovations', location: 'New Francisco', status: 'open' },
    { title: 'Product Manager', employer: 'Creative Solutions', location: 'Los Angeles', status: 'closed' }
  ];

  const recentApplications = [
    { candidate: 'John Doe', job: 'Software Engineer', status: 'Pending', date: '2024-04-27' },
    { candidate: 'Jane Smith', job: 'Software Engineer', status: 'Rejected', date: '2024-04-21' },
    { candidate: 'Michael Johnson', job: 'Product Manager', status: 'Accepted', date: '2024-04-21' }
  ];

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">ADMIN</div>
        <ul className="admin-nav">
          <li className={panel === 'dashboard' ? 'active' : ''} onClick={() => setPanel('dashboard')}>Dashboard</li>
          <li className={panel === 'users' ? 'active' : ''} onClick={() => setPanel('users')}>Users</li>
          <li className={panel === 'employers' ? 'active' : ''} onClick={() => setPanel('employers')}>Employers</li>
          <li className={panel === 'candidates' ? 'active' : ''} onClick={() => setPanel('candidates')}>Candidates</li>
          <li className={panel === 'jobs' ? 'active' : ''} onClick={() => setPanel('jobs')}>Jobs</li>
        </ul>
      </aside>

      <main className="admin-main">
        {panel === 'dashboard' && (
          <div className="admin-content">
            <h1>Dashboard</h1>

            <div className="stats-grid">
              <StatCard icon="👤" count={employers.length} label="Employers" color="blue" />
              <StatCard icon="👥" count={candidates.length} label="Candidates" color="green" />
              <StatCard icon="💼" count={jobs.length} label="Jobs" color="yellow" />
              <StatCard icon="📄" count={250} label="Applications" color="red" />
            </div>

            <div className="admin-section">
              <h2>Job List</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Employer</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobList.map((job, idx) => (
                    <tr key={idx}>
                      <td>{job.title}</td>
                      <td>{job.employer}</td>
                      <td>{job.location}</td>
                      <td>
                        <span className={`status-badge status-${job.status}`}>
                          {job.status === 'open' ? 'Open' : 'Closed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-section">
              <h2>Recent Applications</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app, idx) => (
                    <tr key={idx}>
                      <td>{app.candidate}</td>
                      <td>{app.job}</td>
                      <td>
                        <span className={`status-badge status-${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>{app.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {panel === 'users' && (
          <div className="admin-content">
            <h1>Users Management</h1>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id}>
                      <td>{user.user_id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status-badge status-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          disabled={loading}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {panel === 'employers' && (
          <div className="admin-content">
            <h1>Employers Management</h1>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Company Name</th>
                    <th>Employer Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Website</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map((emp) => (
                    <tr key={emp.user_id}>
                      <td>{emp.user_id}</td>
                      <td>{emp.company_name}</td>
                      <td>{emp.employer_name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.contact_number || 'N/A'}</td>
                      <td>{emp.company_website || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {panel === 'candidates' && (
          <div className="admin-content">
            <h1>Candidates Management</h1>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Date of Birth</th>
                    <th>Phone Number</th>
                    <th>Skills</th>
                    <th>Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((cand) => (
                    <tr key={cand.user_id}>
                      <td>{cand.user_id}</td>
                      <td>{cand.full_name}</td>
                      <td>{cand.date_of_birth ? new Date(cand.date_of_birth).toLocaleDateString() : 'N/A'}</td>
                      <td>{cand.phone_number || 'N/A'}</td>
                      <td>{cand.skills || 'N/A'}</td>
                      <td>{cand.resume_url ? <a href={cand.resume_url} target="_blank" rel="noopener noreferrer">View</a> : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {panel === 'jobs' && (
          <div className="admin-content">
            <h1>Jobs Management</h1>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Title</th>
                    <th>Employer ID</th>
                    <th>Location</th>
                    <th>Salary Range</th>
                    <th>Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.job_id}>
                      <td>{job.job_id}</td>
                      <td>{job.title}</td>
                      <td>{job.employer_id}</td>
                      <td>{job.location || 'N/A'}</td>
                      <td>{job.salary_range || 'N/A'}</td>
                      <td>
                        <span className={`status-badge status-${job.status}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>{new Date(job.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {panel === 'applications' && <div style={{padding:20}}>Quản lý Applications (placeholder)</div>}
      </main>
    </div>
  );
}
