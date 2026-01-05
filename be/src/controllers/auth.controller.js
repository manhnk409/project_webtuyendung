const authService = require('../services/auth.service');


exports.register = async (req, res) => {
try {
const { username, password, email, role } = req.body;
if (!username || !password) return res.status(400).json({ message: 'username and password required' });


const created = await authService.register({ username, password, email, role });
res.status(201).json({ message: 'User created', user: created });
} catch (err) {
res.status(400).json({ error: err.message });
}
};


exports.login = async (req, res) => {
try {
const { username, password} = req.body;
if (!username || !password) return res.status(400).json({ message: 'username and password required' });


// pass optional role to service for role validation
const result = await authService.login({ username, password });
res.json(result);
} catch (err) {
res.status(400).json({ error: err.message });
}
};