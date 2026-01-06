const db = require('../config/db');

// Applications table columns:
// application_id (PK), job_id (FK), candidate_id (FK), cover_letter, status, applied_at

const Application = {
  create: async ({ job_id, candidate_id, cover_letter }) => {
    const [result] = await db.execute(
      'INSERT INTO applications (job_id, candidate_id, cover_letter, status) VALUES (?, ?, ?, ?)',
      [job_id, candidate_id, cover_letter || '', 'pending']
    );
    return result;
  },

  findByJobAndCandidate: async (job_id, candidate_id) => {
    const [rows] = await db.execute(
      'SELECT * FROM applications WHERE job_id = ? AND candidate_id = ? LIMIT 1',
      [job_id, candidate_id]
    );
    return rows[0] || null;
  },

  findByCandidateId: async (candidate_id) => {
    const [rows] = await db.execute(
      `SELECT a.*, j.title, j.description, j.location, j.salary_range, j.status as job_status 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.job_id 
       WHERE a.candidate_id = ? 
       ORDER BY a.applied_at DESC`,
      [candidate_id]
    );
    return rows;
  },

  findByJobId: async (job_id) => {
    const [rows] = await db.execute(
      `SELECT a.*, c.full_name, c.phone_number, c.resume_url 
       FROM applications a 
       JOIN candidates c ON a.candidate_id = c.user_id 
       WHERE a.job_id = ? 
       ORDER BY a.applied_at DESC`,
      [job_id]
    );
    return rows;
  },

  findByEmployerId: async (employer_id) => {
    const [rows] = await db.execute(
      `SELECT a.*, j.title AS job_title, j.job_id, c.full_name, c.phone_number, c.resume_url
       FROM applications a
       JOIN jobs j ON a.job_id = j.job_id
       JOIN candidates c ON a.candidate_id = c.user_id
       WHERE j.employer_id = ?
       ORDER BY a.applied_at DESC`,
      [employer_id]
    );
    return rows;
  },

  updateStatus: async (application_id, status) => {
    const [result] = await db.execute(
      'UPDATE applications SET status = ? WHERE application_id = ?',
      [status, application_id]
    );
    return result;
  },

  delete: async (application_id) => {
    const [result] = await db.execute('DELETE FROM applications WHERE application_id = ?', [application_id]);
    return result;
  }
};

module.exports = Application;
