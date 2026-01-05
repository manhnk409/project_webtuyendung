import React, { useState, useEffect } from 'react';
import { getEmployerMe, getMyJobs } from '../services/api';

export default function EmployerHome() {
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, jobsRes] = await Promise.all([
        getEmployerMe(),
        getMyJobs()
      ]);
      
      if (empRes && !empRes.error) setEmployer(empRes);
      if (Array.isArray(jobsRes)) setJobs(jobsRes);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const companyName = employer?.company_name || 'Company';
  const activeJobs = jobs?.filter(j => j.status === 'open')?.length || 0;

  return (
    <div className="emp-home">
      <h2>Welcome back, <span className="company-name">{companyName}</span>!</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <section className="quick-stats">
            <div className="stat">
              {activeJobs}
              <div className="label">Active jobs</div>
            </div>
            <div className="stat">
              {jobs?.length || 0}
              <div className="label">Total jobs</div>
            </div>
            <div className="stat">
              48
              <div className="label">CVs received</div>
            </div>
            <div className="stat">
              6
              <div className="label">Expiring</div>
            </div>
          </section>

          <section className="chart">
            <h3>Views by week</h3>
            <div className="chart-box">[Line chart placeholder]</div>
          </section>

          <section className="recent-jobs">
            <h3>Recent job posts</h3>
            {jobs?.slice(0, 5).map((job) => (
              <div key={job.job_id} className="card">
                - {job.title} (posted {new Date(job.created_at).toLocaleDateString()})
                <small style={{ display: 'block', color: '#666' }}>{job.status}</small>
              </div>
            )) || <p>No jobs yet</p>}
          </section>
        </>
      )}
    </div>
  );
}
