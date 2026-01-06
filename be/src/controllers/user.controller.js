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

exports.updateProfile = async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
		const { username, email } = req.body;
		const updated = await User.update(userId, { username, email });
		if (!updated) return res.status(400).json({ message: 'Update failed' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

// alias used by routes: POST /candidates/me
exports.changeProfile = async (req, res) => {
	// for now behave same as updateProfile to avoid missing handler errors
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
		const { username, email } = req.body;
		const updated = await User.update(userId, { username, email });
		if (!updated) return res.status(400).json({ message: 'Update failed' });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
};

// delete current authenticated user
exports.deleteMe = async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
		const result = await User.delete(userId);
		if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
		res.json({ message: 'User deleted' });
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

// Admin delete any user by id
exports.deleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await User.delete(id);
		if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
		res.json({ message: 'User deleted successfully' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};