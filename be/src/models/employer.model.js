const db = require('../config/db');

const Employer = {
  create: async ({ employer_name, company_name, company_address, company_website, email, contact_number }) => {
    // Insert using column names that match the provided fields
    const [result] = await db.execute(
      'INSERT INTO employers (employer_name, company_name, company_address, company_website, email, contact_number) VALUES (?, ?, ?, ?, ?, ?)',
      [employer_name, company_name, company_address, company_website, email, contact_number]
    );
    return result;
  },
  update: async (id, { employer_name, company_name, company_address, company_website, email, contact_number }) => {
    const [result] = await db.execute(
      'UPDATE employers SET employer_name = ?, company_name = ?, company_address = ?, company_website = ?, email = ?, contact_number = ? WHERE id = ?',
      [employer_name, company_name, company_address, company_website, email, contact_number, id]
    );
    if (result.affectedRows > 0) {
      const [rows] = await db.execute('SELECT * FROM employers WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    }
    return null;
  },
  findById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM employers WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },
  findByUserId: async (user_id) => {
    // assume employers table has a `user_id` foreign key linking to users.id
    const [rows] = await db.execute('SELECT * FROM employers WHERE user_id = ? LIMIT 1', [user_id]);
    return rows[0] || null;
  },
    getAll: async () => {
    const [rows] = await db.execute('SELECT * FROM employers');
    return rows;
  },
  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM employers WHERE user_id = ?', [id]);
    return result;
  }
};
module.exports = Employer;