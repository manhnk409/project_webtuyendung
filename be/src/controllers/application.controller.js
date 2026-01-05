const Application = require('../models/application.model');

// Create a new application
exports.createApplication = async (req, res) => {
  try {
    const { job_id, candidate_id, cover_letter } = req.body;

    // Derive candidate id: prefer body when admin, default to current user when candidate
    const effectiveCandidateId = candidate_id || (req.user && req.user.role === 'candidate' ? req.user.id : null);

    if (!job_id || !effectiveCandidateId) {
      return res.status(400).json({ 
        error: 'job_id and candidate_id are required' 
      });
    }

    // Check if application already exists
    const existingApp = await Application.findByJobAndCandidate(job_id, effectiveCandidateId);
    if (existingApp) {
      return res.status(400).json({ 
        error: 'You have already applied to this job' 
      });
    }

    // Create the application
    const result = await Application.create({ 
      job_id, 
      candidate_id: effectiveCandidateId, 
      cover_letter 
    });

    res.status(201).json({ 
      message: 'Application submitted successfully',
      application_id: result.insertId 
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
};

// Get applications by job_id
exports.getApplicationsByJobId = async (req, res) => {
  try {
    const { job_id } = req.params;

    const applications = await Application.findByJobId(job_id);

    res.json({ 
      applications,
      count: applications.length 
    });
  } catch (error) {
    console.error('Get applications by job error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Get applications by candidate_id
exports.getApplicationsByCandidateId = async (req, res) => {
  try {
    const { candidate_id } = req.params;

    const applications = await Application.findByCandidateId(candidate_id);

    res.json({ 
      applications,
      count: applications.length 
    });
  } catch (error) {
    console.error('Get applications by candidate error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { application_id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'rejected', 'accepted'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: pending, rejected, accepted' 
      });
    }

    const result = await Application.updateStatus(application_id, status);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ 
      message: 'Application status updated successfully',
      status 
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

// Delete an application
exports.deleteApplication = async (req, res) => {
  try {
    const { application_id } = req.params;

    const result = await Application.delete(application_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
};
