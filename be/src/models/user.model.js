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
	const found = rows[0] || null;
	if (found) console.debug('[user.model.findByUsername] raw row:', found);
	return found;
},


findById: async (id) => {
const [rows] = await db.execute('SELECT user_id, username, email, role, created_at FROM users WHERE user_id = ? LIMIT 1', [id]);
return rows[0] || null;
},

findByIdWithPassword: async (id) => {
	const [rows] = await db.execute('SELECT * FROM users WHERE user_id = ? LIMIT 1', [id]);
	return rows[0] || null;
},

updatePassword: async (id, hashedPassword) => {
	const [result] = await db.execute('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, id]);
	return result;
},

update: async (id, { username, email }) => {
	const [result] = await db.execute('UPDATE users SET username = ?, email = ? WHERE user_id = ?', [username, email, id]);
	if (result.affectedRows > 0) {
		const [rows] = await db.execute('SELECT user_id, username, email, role, created_at FROM users WHERE user_id = ? LIMIT 1', [id]);
		return rows[0] || null;
	}
	return null;
},


getAll: async () => {
const [rows] = await db.execute('SELECT user_id, username, email, role, created_at FROM users');
return rows;
}
,
delete: async (id) => {
	const [result] = await db.execute('DELETE FROM users WHERE user_id = ?', [id]);
 	return result;
}
};


module.exports = User;