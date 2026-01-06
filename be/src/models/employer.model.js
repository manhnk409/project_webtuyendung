const db = require('../config/db');

const Employer = {
  create: async ({ employer_name, company_name, company_address, company_website, email, contact_number }) => {
    
    const [result] = await db.execute(
      'INSERT INTO employers (employer_name, company_name, company_address, company_website, email, contact_number) VALUES (?, ?, ?, ?, ?, ?)',
      [employer_name, company_name, company_address, company_website, email, contact_number]
    );
    const insertedId = result.insertId;
    const [rows] = await db.execute('SELECT * FROM employers WHERE id = ? LIMIT 1', [insertedId]);
    return rows[0] || null;
  },

  update: async (key, { employer_name, company_name, company_address, company_website, email, contact_number }) => {
    const identifier = key;
    const [result] = await db.execute(
      'UPDATE employers SET employer_name = ?, company_name = ?, company_address = ?, company_website = ?, email = ?, contact_number = ? WHERE user_id = ? OR id = ?',
      [employer_name, company_name, company_address, company_website, email, contact_number, identifier, identifier]
    );
    if (result.affectedRows > 0) {
      const [rows] = await db.execute('SELECT * FROM employers WHERE user_id = ? OR id = ? LIMIT 1', [identifier, identifier]);
      return rows[0] || null;
    }
    return null;
  },

  findById: async (id) => {
    // Accept either user_id or legacy id column if present
    const [rows] = await db.execute('SELECT * FROM employers WHERE user_id = ? OR id = ? LIMIT 1', [id, id]);
    return rows[0] || null;
  },

  findByUserId: async (user_id) => {
    const [rows] = await db.execute('SELECT * FROM employers WHERE user_id = ? LIMIT 1', [user_id]);
    return rows[0] || null;
  },

  getAll: async () => {
    const [rows] = await db.execute('SELECT * FROM employers');
    return rows;
  },

  delete: async (user_id) => {
    const [result] = await db.execute('DELETE FROM employers WHERE user_id = ? OR id = ?', [user_id, user_id]);
    return result;
  }
};
module.exports = Employer;