require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'webtuyendung',
      connectTimeout: 10000
    });

    const [rows] = await conn.execute('SELECT 1 as ok');
    console.log('DB connection successful:', rows);
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('DB connection error:', err && err.code ? { code: err.code, message: err.message } : err);
    // print stack for deeper debugging
    console.error(err.stack || err);
    process.exit(1);
  }
})();
