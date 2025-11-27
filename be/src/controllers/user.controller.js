const User = require('../models/user.model');


exports.getProfile = async (req, res) => {
try {
const user = await User.findById(req.user.id);
if (!user) return res.status(404).json({ message: 'User not found' });
res.json(user);
} catch (err) {
res.status(500).json({ error: err.message });
}
};


exports.getAllUsers = async (req, res) => {
try {
const users = await User.getAll();
res.json(users);
} catch (err) {
res.status(500).json({ error: err.message });
}
};