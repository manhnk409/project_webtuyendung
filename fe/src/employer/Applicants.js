import React, { useState, useEffect } from 'react';
import { getAllMyApplications, updateApplicationStatus } from '../services/api';

export default function Applicants() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, accepted, rejected
  const [filterJob, setFilterJob] = useState('all');

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await getAllMyApplications();
      setApplications(res.applications || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      alert('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const onUpdateStatus = async (app, status) => {
    const appId = app.application_id || app.id;
    setUpdatingAppId(appId);
    try {
      await updateApplicationStatus(appId, status);
      setApplications((list) =>
        list.map((a) => (a.application_id === appId || a.id === appId ? { ...a, status } : a))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update application status');
    } finally {
      setUpdatingAppId(null);
    }
  };

  // Get unique job titles for filter
  const uniqueJobs = [...new Set(applications.map(a => a.job_title))].filter(Boolean);

  // Filter applications
  const filteredApps = applications.filter(app => {
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;
    if (filterJob !== 'all' && app.job_title !== filterJob) return false;
    return true;
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>All Applicants</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>
        View and manage all applicants who have applied to your job postings.
      </p>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 15, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: 8 }}><strong>Status:</strong></label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.select}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label style={{ marginRight: 8 }}><strong>Job:</strong></label>
          <select value={filterJob} onChange={(e) => setFilterJob(e.target.value)} style={styles.select}>
            <option value="all">All Jobs</option>
            {uniqueJobs.map((job) => (
              <option key={job} value={job}>{job}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <strong>Total: {filteredApps.length}</strong> applicant{filteredApps.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading && <p>Loading applications...</p>}

      {!loading && filteredApps.length === 0 && (
        <p style={{ color: '#999', fontStyle: 'italic' }}>No applications found.</p>
      )}

      {!loading && filteredApps.length > 0 && (
        <div style={{ display: 'grid', gap: 15 }}>
          {filteredApps.map((app) => {
            const appId = app.application_id || app.id;
            const isUpdating = updatingAppId === appId;

            return (
              <div key={appId} style={styles.card}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1.1em', color: '#333' }}>
                        {app.full_name || `Candidate #${app.candidate_id}`}
                      </h3>
                      <div style={{ fontSize: '0.95em', color: '#007bff', marginTop: 4 }}>
                        Applied for: <strong>{app.job_title}</strong>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.85em',
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontWeight: 'bold',
                      background: app.status === 'pending' ? '#fff3cd' : app.status === 'accepted' ? '#d4edda' : '#f8d7da',
                      color: app.status === 'pending' ? '#856404' : app.status === 'accepted' ? '#155724' : '#721c24'
                    }}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: 6, fontSize: '0.9em' }}>
                    {app.phone_number && (
                      <div><strong>Phone:</strong> {app.phone_number}</div>
                    )}
                    {app.resume_url && (
                      <div>
                        <strong>Resume:</strong>{' '}
                        <a href={app.resume_url} target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>
                          View Resume
                        </a>
                      </div>
                    )}
                    <div><strong>Applied at:</strong> {new Date(app.applied_at || app.created_at).toLocaleString()}</div>
                    {app.cover_letter && (
                      <div style={{ marginTop: 8 }}>
                        <strong>Cover Letter:</strong>
                        <div style={{ 
                          marginTop: 4, 
                          padding: 8, 
                          background: '#f9f9f9', 
                          border: '1px solid #eee', 
                          borderRadius: 4,
                          fontSize: '0.95em',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {app.cover_letter}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Change Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                  {['pending', 'accepted', 'rejected'].map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(app, st)}
                      disabled={isUpdating || loading}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 4,
                        border: '1px solid #ccc',
                        background: app.status === st ? '#d1ecf1' : '#fff',
                        cursor: isUpdating || loading ? 'not-allowed' : 'pointer',
                        fontWeight: app.status === st ? 'bold' : 'normal',
                        opacity: isUpdating || loading ? 0.6 : 1
                      }}
                    >
                      {st === 'pending' ? '⏳ Pending' : st === 'accepted' ? '✓ Accept' : '✗ Reject'}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    padding: 20,
    border: '1px solid #ddd',
    borderRadius: 8,
    background: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    display: 'flex',
    gap: 20,
    alignItems: 'start'
  },
  select: {
    padding: '6px 10px',
    borderRadius: 4,
    border: '1px solid #ccc',
    fontSize: '0.95em'
  }
};
