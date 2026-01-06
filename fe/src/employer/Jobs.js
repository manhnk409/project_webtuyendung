import React, { useState, useEffect } from 'react';
import { getMyJobs, createJob, updateJob, deleteJob, getApplicationsByJob, updateApplicationStatus } from '../services/api';

const ITEMS_PER_PAGE = 5;

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Forms and Modals state
  const [creating, setCreating] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  
  // Candidates state
  const [viewingCandidates, setViewingCandidates] = useState(null); // The job whose candidates we are viewing
  const [candidates, setCandidates] = useState([]);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  const [form, setForm] = useState({ title: '', description: '', location: '', salary_range: '', requirements: '', status: 'open' });

  // Fetch jobs from API
  const loadJobs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getMyJobs(page, ITEMS_PER_PAGE);
      if (res && Array.isArray(res)) {
        setTotalJobs(res.length);
        const start = (page - 1) * ITEMS_PER_PAGE;
        const paged = res.slice(start, start + ITEMS_PER_PAGE);
        setJobs(paged);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(1);
  }, []);

  const totalPages = Math.ceil(totalJobs / ITEMS_PER_PAGE);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.title) return alert('Title is required');
    
    try {
      setLoading(true);
      const res = await createJob(form);
      if (res && res.job_id) {
        alert('Job created successfully!');
        setForm({ title: '', description: '', location: '', salary_range: '', requirements: '', status: 'open' });
        setCreating(false);
        await loadJobs(1);
      } else {
        alert('Failed to create job');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error creating job');
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    setForm({ title: '', description: '', location: '', salary_range: '', requirements: '', status: 'open' });
    setCreating(false);
    setEditingJob(null);
  };

  const onViewDetails = (job) => {
    setViewingJob(job);
    setViewingCandidates(null);
    setEditingJob(null);
    setCreating(false);
  };

  const onViewCandidates = async (job) => {
    setLoading(true);
    try {
      const res = await getApplicationsByJob(job.job_id || job.id);
      setCandidates(res.applications || []);
      setViewingCandidates(job);
      setViewingJob(null);
      setEditingJob(null);
      setCreating(false);
    } catch (err) {
      console.error(err);
      alert('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (job) => {
    if (!window.confirm(`Are you sure you want to delete job "${job.title}"?`)) return;
    try {
      setLoading(true);
      await deleteJob(job.job_id || job.id);
      alert('Job deleted');
      loadJobs(currentPage);
    } catch (err) {
      alert('Failed to delete job');
    } finally {
      setLoading(false);
    }
  };

  const onUpdateApplicationStatus = async (app, status) => {
    const appId = app.application_id || app.id;
    setUpdatingAppId(appId);
    try {
      await updateApplicationStatus(appId, status);
      setCandidates((list) =>
        list.map((a) => (a.application_id === appId || a.id === appId ? { ...a, status } : a))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update application status');
    } finally {
      setUpdatingAppId(null);
    }
  };

  const onEdit = (job) => {
    setEditingJob(job);
    setForm({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      salary_range: job.salary_range || '',
      requirements: job.requirements || '',
      status: job.status || 'open'
    });
    setViewingJob(null); // Close detail view if open
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    if (!form.title) return alert('Title is required');
    
    try {
      setLoading(true);
      const res = await updateJob(editingJob.job_id || editingJob.id, form);
      if (res) {
        alert('Job updated successfully!');
        setEditingJob(null);
        setForm({ title: '', description: '', location: '', salary_range: '', requirements: '', status: 'open' });
        await loadJobs(currentPage);
      } else {
        alert('Failed to update job');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error updating job');
    } finally {
      setLoading(false);
    }
  };

  const onStatusChange = async (newStatus) => {
     if (!viewingJob) return;
     try {
         setLoading(true);
         const payload = { ...viewingJob, status: newStatus };
         // remove ID from payload if present to avoid pollution, though controller might ignore it
         // but strictly we should send fields to update. The updateJob helper takes ID separately.
         
         const res = await updateJob(viewingJob.job_id || viewingJob.id, payload);
         if (res) {
             setViewingJob({ ...viewingJob, status: newStatus });
             // update list in background
             loadJobs(currentPage);
             alert('Status updated to ' + newStatus);
         }
     } catch(e) {
         alert('Failed to update status');
     } finally {
         setLoading(false);
     }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Job Posts</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setCreating(true)} disabled={loading}>+ Make a new Job</button>
      </div>

      {creating && (
        <form onSubmit={onSave} style={styles.formContainer}>
            <h3>Create New Job</h3>
            <div style={styles.grid}>
            <label>Title <input name="title" value={form.title} onChange={onChange} style={styles.input} disabled={loading} /></label>
            <label>Description <textarea name="description" value={form.description} onChange={onChange} rows={4} style={styles.input} disabled={loading} /></label>
            <label>Requirements <textarea name="requirements" value={form.requirements} onChange={onChange} rows={3} style={styles.input} disabled={loading} /></label>
            <label>Location <input name="location" value={form.location} onChange={onChange} style={styles.input} disabled={loading} /></label>
            <label>Salary Range <input name="salary_range" value={form.salary_range} onChange={onChange} style={styles.input} disabled={loading} /></label>
            <label>Status
              <select name="status" value={form.status} onChange={onChange} style={styles.input} disabled={loading}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={onCancel} disabled={loading}>Cancel</button>
            </div>
          </div>
        </form>
      )}

      {/* JOB DETAILS VIEW */}
      {viewingJob && (
        <div style={styles.detailContainer}>
          <div style={styles.header}>
            <h3 style={{ margin: 0 }}>Job Details: {viewingJob.title}</h3>
            <button onClick={() => setViewingJob(null)} style={styles.closeBtn}>x Close</button>
          </div>
          
          <div style={styles.detailGrid}>
            <div style={{ padding: '10px', background: '#fff', border: '1px solid #eee' }}>
                <strong>Current Status: </strong>
                <span style={{ 
                    fontWeight: 'bold', 
                    color: viewingJob.status === 'open' ? 'green' : 'red',
                    marginRight: 10
                }}>
                    {viewingJob.status === 'open' ? 'OPEN' : 'CLOSED'}
                </span>
                <button onClick={() => onStatusChange(viewingJob.status === 'open' ? 'closed' : 'open')} disabled={loading} style={{ fontSize: 12 }}>
                    {viewingJob.status === 'open' ? 'Close Job' : 'Re-open Job'}
                </button>
            </div>

            <div><strong>Location:</strong> {viewingJob.location}</div>
            <div><strong>Salary:</strong> {viewingJob.salary_range}</div>
            <div><strong>Description:</strong> <div style={styles.ws}>{viewingJob.description}</div></div>
            <div><strong>Requirements:</strong> <div style={styles.ws}>{viewingJob.requirements}</div></div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => { onEdit(viewingJob); }}
              style={styles.btnPrimary}
            >
              Edit Full Details
            </button>
          </div>
        </div>
      )}

      {/* EDIT JOB FORM */}
      {editingJob && (
        <form onSubmit={onUpdate} style={{ ...styles.formContainer, borderColor: '#28a745' }}>
          <h3>Edit Job: {editingJob.title}</h3>
          <div style={styles.grid}>
            <label>Title <input name="title" value={form.title} onChange={onChange} style={styles.input} disabled={loading} /></label>
            <label>Description <textarea name="description" value={form.description} onChange={onChange} rows={4} style={styles.input} disabled={loading} /></label>
            <label>Requirements <textarea name="requirements" value={form.requirements} onChange={onChange} rows={3} style={styles.input} disabled={loading} /></label>
            <label>Location <input name="location" value={form.location} onChange={onChange} style={styles.input} disabled={loading} /></label>
            <label>Salary Range <input name="salary_range" value={form.salary_range} onChange={onChange} style={styles.input} disabled={loading} /></label>
            <label>Status
              <select name="status" value={form.status} onChange={onChange} style={styles.input} disabled={loading}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update'}</button>
              <button type="button" onClick={onCancel} disabled={loading}>Cancel</button>
            </div>
          </div>
        </form>
      )}

      {/* CANDIDATES VIEW */}
      {viewingCandidates && (
        <div style={styles.detailContainer}>
             <div style={styles.header}>
                <h3 style={{ margin: 0 }}>Candidates for: {viewingCandidates.title}</h3>
                <button onClick={() => setViewingCandidates(null)} style={styles.closeBtn}>x Close</button>
             </div>
             {candidates.length === 0 ? (
                 <p>No candidates have applied yet.</p>
             ) : (
                 <div style={{ display: 'grid', gap: 10 }}>
                     {candidates.map(app => (
                         <div key={app.application_id || app.id} style={{ padding: 10, border: '1px solid #eee', background: '#fff' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                               <div style={{ flex: 1 }}>
                                 <div><strong>Candidate ID:</strong> {app.candidate_id}</div>
                                 {app.full_name && <div><strong>Name:</strong> {app.full_name}</div>}
                                 {app.phone_number && <div><strong>Phone:</strong> {app.phone_number}</div>}
                                 {app.resume_url && (
                                   <div>
                                     <strong>Resume:</strong> <a href={app.resume_url} target="_blank" rel="noreferrer">View</a>
                                   </div>
                                 )}
                                 <div><strong>Applied at:</strong> {new Date(app.created_at).toLocaleString()}</div>
                                 <div><strong>Status:</strong> {app.status}</div>
                                 {app.cover_letter && (
                                     <div style={{ marginTop: 5, background: '#f9f9f9', padding: 5, fontSize: 13 }}>
                                         <em>"{app.cover_letter}"</em>
                                     </div>
                                 )}
                               </div>
                               <div style={{ display: 'grid', gap: 6, minWidth: 140 }}>
                                 {['pending','accepted','rejected'].map((st) => (
                                   <button
                                     key={st}
                                     onClick={() => onUpdateApplicationStatus(app, st)}
                                     disabled={updatingAppId === (app.application_id || app.id) || loading}
                                     style={{
                                       padding: '6px 8px',
                                       borderRadius: 4,
                                       border: '1px solid #ccc',
                                       background: app.status === st ? '#d1ecf1' : '#fff',
                                       cursor: 'pointer'
                                     }}
                                   >
                                     Set {st}
                                   </button>
                                 ))}
                               </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
        </div>
      )}

      {/* JOB LIST */}
      <div className="job-list">
        {jobs.length === 0 && !loading && <p>No jobs found.</p>}
        {jobs.map((j) => (
          <div key={j.job_id || j.id} className="job-card" style={styles.card}>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <strong style={{ fontSize: '1.1em' }}>{j.title}</strong>
                    <span style={{ 
                        fontSize: '0.8em', 
                        padding: '2px 6px', 
                        borderRadius: 4, 
                        background: j.status === 'open' ? '#d4edda' : '#f8d7da',
                        color: j.status === 'open' ? '#155724' : '#721c24'
                    }}>
                        {j.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                </div>
                <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                    {j.location} • {j.salary_range}
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', minWidth: 200 }}>
                <button onClick={() => onViewDetails(j)} style={styles.btnInfo}>
                    Details / Status
                </button>
                <button onClick={() => onViewCandidates(j)} style={styles.btnInfo}>
                    Candidates
                </button>
                <button onClick={() => onDelete(j)} style={styles.btnDanger}>
                    Delete
                </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button onClick={() => loadJobs(currentPage - 1)} disabled={currentPage === 1 || loading}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => loadJobs(currentPage + 1)} disabled={currentPage === totalPages || loading}>Next</button>
        </div>
      )}
    </div>
  );
}

const styles = {
    formContainer: { border: '1px solid #ddd', padding: 15, marginBottom: 15, borderRadius: 4, maxWidth: 800, background: '#f9f9f9' },
    detailContainer: { border: '2px solid #007bff', padding: 15, marginBottom: 15, borderRadius: 4, backgroundColor: '#f0f7ff' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 },
    closeBtn: { cursor: 'pointer', padding: '2px 8px' },
    grid: { display: 'grid', gap: 10 },
    detailGrid: { display: 'grid', gap: 8 },
    input: { width: '100%', padding: 5 },
    ws: { whiteSpace: 'pre-wrap', marginTop: 4 },
    card: { padding: 15, border: '1px solid #eee', marginBottom: 10, borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 15, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    btnPrimary: { padding: '6px 12px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4 },
    btnInfo: { padding: '6px 12px', cursor: 'pointer', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: 4 },
    btnDanger: { padding: '6px 12px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4 },
};
