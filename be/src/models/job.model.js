const db = require('../config/db');

// Jobs table columns:
// job_id (PK), employer_id (FK), title, description, requirements, location, salary_range, status, created_at

const Job = {
  create: async ({ employer_id, title, description, requirements, location, salary_range, status }) => {
    const [result] = await db.execute(
      'INSERT INTO jobs (employer_id, title, description, requirements, location, salary_range, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [employer_id, title, description, requirements, location, salary_range, status || 'open']
    );
    return result;
  },

  update: async (job_id, { title, description, requirements, location, salary_range, status }) => {
    const [result] = await db.execute(
      'UPDATE jobs SET title = ?, description = ?, requirements = ?, location = ?, salary_range = ?, status = ? WHERE job_id = ?',
      [title, description, requirements, location, salary_range, status, job_id]
    );
    if (result.affectedRows > 0) {
      const [rows] = await db.execute('SELECT * FROM jobs WHERE job_id = ? LIMIT 1', [job_id]);
      return rows[0] || null;
    }
    return null;
  },

  findById: async (job_id) => {
    const [rows] = await db.execute('SELECT * FROM jobs WHERE job_id = ? LIMIT 1', [job_id]);
    return rows[0] || null;
  },

  findByEmployerId: async (employer_id) => {
    const [rows] = await db.execute('SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC', [employer_id]);
    return rows;
  },

  getAll: async () => {
    const [rows] = await db.execute('SELECT * FROM jobs ORDER BY created_at DESC');
    return rows;
  },

  getOpenJobs: async () => {
    const [rows] = await db.execute("SELECT * FROM jobs WHERE status = 'open' ORDER BY created_at DESC");
    return rows;
  },

  delete: async (job_id) => {
    const [result] = await db.execute('DELETE FROM jobs WHERE job_id = ?', [job_id]);
    return result;
  }
};

module.exports = Job;
