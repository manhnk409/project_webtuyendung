import React, { useState, useEffect } from 'react';
import { getMyJobs, createJob, updateJob, deleteJob } from '../services/api';

const ITEMS_PER_PAGE = 5;

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const [creating, setCreating] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', location: '', salary_range: '', requirements: '', status: 'open' });

  // Fetch jobs from API
  const loadJobs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getMyJobs();
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

  return (
    <div style={{ padding: 20 }}>
      <h2>Job Posts</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setCreating(true)} disabled={loading}>Create Job</button>
      </div>

      {creating && (
        <form onSubmit={onSave} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12, borderRadius: 4, maxWidth: 700 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label>
              Title
              <input name="title" value={form.title} onChange={onChange} style={{ width: '100%' }} disabled={loading} />
            </label>
            <label>
              Description
              <textarea name="description" value={form.description} onChange={onChange} rows={4} style={{ width: '100%' }} disabled={loading} />
            </label>
            <label>
              Requirements
              <textarea name="requirements" value={form.requirements} onChange={onChange} rows={3} style={{ width: '100%' }} disabled={loading} />
            </label>
            <label>
              Location
              <input name="location" value={form.location} onChange={onChange} style={{ width: '100%' }} disabled={loading} />
            </label>
            <label>
              Salary Range
              <input name="salary_range" value={form.salary_range} onChange={onChange} style={{ width: '100%' }} disabled={loading} />
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={onChange} style={{ width: '100%' }} disabled={loading}>
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

      {viewingJob && (
        <div style={{ border: '2px solid #007bff', padding: 16, marginBottom: 12, borderRadius: 4, backgroundColor: '#f8f9fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Job Details</h3>
            <button onClick={() => setViewingJob(null)} style={{ padding: '4px 12px', cursor: 'pointer' }}>✕ Close</button>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div><strong>Job ID:</strong> {viewingJob.job_id || viewingJob.id}</div>
            <div><strong>Title:</strong> {viewingJob.title}</div>
            <div><strong>Status:</strong> {viewingJob.status === 'open' ? 'Open' : 'Closed'}</div>
            <div><strong>Location:</strong> {viewingJob.location}</div>
            <div><strong>Salary Range:</strong> {viewingJob.salary_range}</div>
            <div><strong>Description:</strong> <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{viewingJob.description}</div></div>
            <div><strong>Requirements:</strong> <div style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{viewingJob.requirements}</div></div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button 
              onClick={() => { onEdit(viewingJob); setViewingJob(null); }}
              style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4 }}
            >
              Edit This Job
            </button>
          </div>
        </div>
      )}

      {editingJob && (
        <form onSubmit={onUpdate} style={{ border: '2px solid #28a745', padding: 12, marginBottom: 12, borderRadius: 4, maxWidth: 700 }}>
          <h3>Edit Job: {editingJob.title}</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <label>
              Title
              <input name="title" value={form.title} onChange={onChange} style={{ width: '100%' }} disabled={loading} />
            </label>
            <label>
              Description
              <textarea name="description" value={form.description} onChange={onChange} rows={4} style={{ width: '100%' }} disabled={loading} />
            </label>
            <label>
              Requirements
              <textarea name="requirements" value={form.requirements} onChange={onChange} rows={3} style={{ width: '100%' }} disabled={loading} />
            </label>
            <label>
              Location
              <input name="location" value={form.location} onChange={onChange} style={{ width: '100%' }} disabled={loading} />
            </label>
            <label>
              Salary Range
              <input name="salary_range" value={form.salary_range} onChange={onChange} style={{ width: '100%' }} disabled={loading} />
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={onChange} style={{ width: '100%' }} disabled={loading}>
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

      {loading && jobs.length === 0 && <p>Loading jobs...</p>}

      <div className="job-list">
        {jobs.map((j) => (
          <div key={j.job_id || j.id} className="job-card" style={{ padding: 12, border: '1px solid #eee', marginBottom: 8, borderRadius: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <strong>{j.title}</strong> — <small>{j.status === 'open' ? 'Open' : 'Closed'}</small>
                <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{j.location} • {j.salary_range}</div>
                {j.description && <div style={{ marginTop: 8, fontSize: 13 }}>{j.description}</div>}
                {j.requirements && <div style={{ marginTop: 4, fontSize: 12, color: '#666' }}>Required: {j.requirements}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
                <button 
                  onClick={() => onViewDetails(j)}
                  style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          <button onClick={() => loadJobs(currentPage - 1)} disabled={currentPage === 1 || loading}>← Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => loadJobs(currentPage + 1)} disabled={currentPage === totalPages || loading}>Next →</button>
        </div>
      )}
    </div>
  );
}
