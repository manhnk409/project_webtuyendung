const Candidate = require('../models/candidate.model');
const User = require('../models/user.model');
const Job = require('../models/job.model');
const Application = require('../models/application.model');
const bcrypt = require('bcrypt');

exports.getAllCandidates = async (req, res) => {
  try {
    const rows = await Candidate.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const cand = await Candidate.findById(id);
    if (!cand) return res.status(404).json({ message: 'Candidate not found' });
    res.json(cand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCandidate = async (req, res) => {
  try {
    const { user_id, full_name, date_of_birth, phone_number, resume_url, skills } = req.body;
    if (!user_id || !full_name) return res.status(400).json({ message: 'user_id and full_name required' });

    const result = await Candidate.create({ user_id, full_name, date_of_birth, phone_number, resume_url, skills });
    res.status(201).json({ message: 'Candidate created', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const { id } = req.params; // id here is user_id
    const payload = req.body;
    const result = await Candidate.update(id, payload);
    res.json({ message: 'Updated', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params; // id is user_id
    const result = await Candidate.delete(id);
    res.json({ message: 'Deleted', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// candidate - current authenticated user's profile
exports.getMe = async (req, res) => {
  try {
    let userId = req.user && (req.user.id || req.user.user_id || null);
    if (!userId && req.user && req.user.username) {
      try {
        const foundUser = await User.findByUsername(req.user.username);
        if (foundUser) {
          const resolved = foundUser.id || foundUser.user_id || foundUser.ID || foundUser.userId || null;
          if (resolved) userId = resolved;
        }
      } catch (e) {
        console.warn('[candidate.getMe] user lookup failed:', e.message);
      }
    }

    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
    const cand = await Candidate.findByUserId(userId);
    if (!cand) return res.status(404).json({ message: 'Candidate profile not found' });
    res.json(cand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    let userId = req.user && req.user.id;
    if (!userId && req.user && req.user.username) {
      try {
        const foundUser = await User.findByUsername(req.user.username);
        if (foundUser && foundUser.id) userId = foundUser.id;
      } catch (e) {
        console.warn('[candidate.updateMe] user lookup failed:', e.message);
      }
    }
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
    const cand = await Candidate.findByUserId(userId);
    if (!cand) return res.status(404).json({ message: 'Candidate profile not found' });

    const payload = req.body;
    const updated = await Candidate.update(userId, payload);
    if (!updated) return res.status(400).json({ message: 'Update failed' });
    res.json({ message: 'Updated', candidate: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'currentPassword and newPassword required' });

    const user = await User.findByIdWithPassword(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Current password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hashed);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
    const cand = await Candidate.findByUserId(userId);
    if (!cand) return res.status(404).json({ message: 'Candidate profile not found' });
    const result = await Candidate.delete(userId);
    res.json({ message: 'Candidate profile deleted', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get available jobs for candidates (only jobs with status = 'open')
exports.getAvailableJobs = async (req, res) => {
  try {
    const allJobs = await Job.getAll();
    // Filter only open jobs
    const openJobs = allJobs.filter(job => job.status === 'open');
    res.json(openJobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Apply to a job
exports.applyToJob = async (req, res) => {
  try {
    const { id } = req.params; // job_id
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });

    // Check if job exists and is open
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ message: 'Job is not open for applications' });

    // Check if candidate profile exists
    const cand = await Candidate.findByUserId(userId);
    if (!cand) return res.status(404).json({ message: 'Candidate profile not found' });

    // Check if already applied
    const existing = await Application.findByJobAndCandidate(id, userId);
    if (existing) return res.status(400).json({ message: 'Already applied to this job' });

    // Create application
    const { cover_letter } = req.body;
    const result = await Application.create({
      job_id: id,
      candidate_id: userId,
      cover_letter
    });

    res.status(201).json({ message: 'Application submitted', application_id: result.insertId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get jobs that the candidate has applied to
exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });

    const applications = await Application.findByCandidateId(userId);
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
