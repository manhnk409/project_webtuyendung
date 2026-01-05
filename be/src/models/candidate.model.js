const db = require('../config/db');

// Candidate table columns (per provided schema):
// user_id (PK), full_name, date_of_birth, phone_number, resume_url, skills

const Candidate = {
  create: async ({ user_id, full_name, date_of_birth, phone_number, resume_url, skills }) => {
    const [result] = await db.execute(
      'INSERT INTO candidates (user_id, full_name, date_of_birth, phone_number, resume_url, skills) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, full_name, date_of_birth, phone_number, resume_url, skills]
    );
    return result;
  },

  update: async (user_id, { full_name, date_of_birth, phone_number, resume_url, skills }) => {
    const [result] = await db.execute(
      'UPDATE candidates SET full_name = ?, date_of_birth = ?, phone_number = ?, resume_url = ?, skills = ? WHERE user_id = ?',
      [full_name, date_of_birth, phone_number, resume_url, skills, user_id]
    );
    if (result.affectedRows > 0) {
      const [rows] = await db.execute('SELECT * FROM candidates WHERE user_id = ? LIMIT 1', [user_id]);
      return rows[0] || null;
    }
    return null;
  },

  findById: async (user_id) => {
    const [rows] = await db.execute('SELECT * FROM candidates WHERE user_id = ? LIMIT 1', [user_id]);
    return rows[0] || null;
  },

  // alias for findById (keeps compatibility with other code)
  findByUserId: async (user_id) => {
    return Candidate.findById(user_id);
  },

  getAll: async () => {
    const [rows] = await db.execute('SELECT * FROM candidates');
    return rows;
  },

  delete: async (user_id) => {
    const [result] = await db.execute('DELETE FROM candidates WHERE user_id = ?', [user_id]);
    return result;
  }
};

module.exports = Candidate;

