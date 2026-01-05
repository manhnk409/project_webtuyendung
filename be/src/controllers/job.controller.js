const Job = require('../models/job.model');
const User = require('../models/user.model');

// Get all jobs (admin sees all, employer sees only their jobs)
exports.getAllJobs = async (req, res) => {
  try {
    const userRole = req.user && req.user.role;
    const userId = req.user && req.user.id;

    if (userRole === 'admin') {
      // Admin can see all jobs
      const jobs = await Job.getAll();
      return res.json(jobs);
    }

    if (userRole === 'employer') {
      // Employer sees only their own jobs
      // Need to get employer_id from users or employers table
      const jobs = await Job.findByEmployerId(userId);
      return res.json(jobs);
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check authorization: admin can see any, employer can see only theirs
    const userRole = req.user && req.user.role;
    const userId = req.user && req.user.id;

    if (userRole === 'admin') {
      return res.json(job);
    }

    if (userRole === 'employer' && job.employer_id === userId) {
      return res.json(job);
    }

    return res.status(403).json({ message: 'Forbidden: not your job' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new job
exports.createJob = async (req, res) => {
  try {
    const { title, description, requirements, location, salary_range, status } = req.body;
    const userId = req.user && req.user.id;
    const userRole = req.user && req.user.role;

    if (!title || !description) {
      return res.status(400).json({ message: 'title and description required' });
    }

    // For employer, employer_id = their user_id; for admin, can specify employer_id
    let employer_id = userId;
    if (userRole === 'admin' && req.body.employer_id) {
      employer_id = req.body.employer_id;
    }

    const result = await Job.create({
      employer_id,
      title,
      description,
      requirements,
      location,
      salary_range,
      status
    });

    res.status(201).json({ message: 'Job created', job_id: result.insertId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const userId = req.user && req.user.id;
    const userRole = req.user && req.user.role;

    // Check if job exists and user has permission
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (userRole !== 'admin' && job.employer_id !== userId) {
      return res.status(403).json({ message: 'Forbidden: not your job' });
    }

    const updated = await Job.update(id, payload);
    if (!updated) return res.status(400).json({ message: 'Update failed' });

    res.json({ message: 'Job updated', job: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && req.user.id;
    const userRole = req.user && req.user.role;

    // Check if job exists and user has permission
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (userRole !== 'admin' && job.employer_id !== userId) {
      return res.status(403).json({ message: 'Forbidden: not your job' });
    }

    const result = await Job.delete(id);
    res.json({ message: 'Job deleted', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get jobs by current employer
exports.getJobsByEmployer = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const userRole = req.user && req.user.role;

    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });

    // For admin, they can see all jobs or specify employer_id in query
    if (userRole === 'admin') {
      const employer_id = req.query.employer_id;
      if (employer_id) {
        const jobs = await Job.findByEmployerId(employer_id);
        return res.json(jobs);
      }
      const jobs = await Job.getAll();
      return res.json(jobs);
    }

    // For employer, get their own jobs
    const jobs = await Job.findByEmployerId(userId);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all open jobs (available for candidates)
exports.getOpenJobs = async (req, res) => {
  try {
    const jobs = await Job.getOpenJobs();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
