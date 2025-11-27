const db = require('../config/db');


const User = {
create: async ({ username, password, email, role = 'user' }) => {
const [result] = await db.execute(
'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
[username, password, email, role]
);
// mysql2 returns the insert id as `insertId` on the result (OkPacket)
return { id: result.insertId, username, email, role };
},


findByUsername: async (username) => {
const [rows] = await db.execute('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
return rows[0] || null;
},


findById: async (id) => {
const [rows] = await db.execute('SELECT id, username, email, role, created_at FROM users WHERE id = ? LIMIT 1', [id]);
return rows[0] || null;
},


getAll: async () => {
const [rows] = await db.execute('SELECT id, username, email, role, created_at FROM users');
return rows;
}
};


module.exports = User;