const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');


const SALT_ROUNDS = 10;


module.exports = {
register: async ({ username, password, email, role }) => {
const existing = await User.findByUsername(username);
if (existing) throw new Error('Username already taken');


const hashed = await bcrypt.hash(password, SALT_ROUNDS);
const created = await User.create({ username, password: hashed, email, role });
return created;
},


login: async ({ username, password }) => {
const user = await User.findByUsername(username);
if (!user) throw new Error('Invalid credentials');


const match = await bcrypt.compare(password, user.password);
if (!match) throw new Error('Invalid credentials');


// create token (payload minimal)
const payload = { id: user.id, username: user.username, role: user.role };
const token = jwt.sign(payload, process.env.JWT_SECRET, {
expiresIn: process.env.JWT_EXPIRES_IN || '1h'
});


return { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } };
}
};