const Employer = require('../models/employer.model');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

exports.getAllEmployers = async (req, res) => {
  try {
    const rows = await Employer.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEmployerById = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await Employer.findById(id);
    if (!emp) return res.status(404).json({ message: 'Employer not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEmployer = async (req, res) => {
  try {
    const { user_id, employer_name, company_name, company_address, company_website, email, contact_number } = req.body;
    if (!employer_name || !company_name || !email) {
      return res.status(400).json({ message: 'employer_name, company_name and email are required' });
    }

    // user_id optional; if present we keep 1:1 with a user, otherwise DB auto-generates id
    const employer = await Employer.create({ user_id, employer_name, company_name, company_address, company_website, email, contact_number });
    res.status(201).json({ message: 'Employer created', employer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const employer = await Employer.update(id, payload);
    if (!employer) return res.status(404).json({ message: 'Employer not found or not updated' });
    res.json({ message: 'Updated', employer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Employer.delete(id);
    res.json({ message: 'Deleted', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// employer - current authenticated user's profile
exports.getMe = async (req, res) => {
  try {
    // prefer numeric id in token payload, then legacy user_id
    let userId = req.user && (req.user.id || req.user.user_id || null);
    // if id missing, try to resolve by username
    if (!userId && req.user && req.user.username) {
      try {
        const foundUser = await User.findByUsername(req.user.username);
        console.warn('[employer.getMe] lookup by username result:', !!foundUser, foundUser ? { id: foundUser.id, user_id: foundUser.user_id, username: foundUser.username } : null);
        if (foundUser) {
          const resolved = foundUser.id || foundUser.user_id || foundUser.ID || foundUser.userId || null;
          if (resolved) userId = resolved;
        }
      } catch (e) {
        console.warn('[employer.getMe] user lookup failed:', e.message);
      }
    }

    if (!userId) {
      console.warn('[employer.getMe] unauthenticated: req.user=', req.user);
      return res.status(401).json({ message: 'Unauthenticated' });
    }
    const emp = await Employer.findByUserId(userId);
    if (!emp) return res.status(404).json({ message: 'Employer profile not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMe = async (req, res) => {
  try {
    let userId = req.user && req.user.id;
    if (!userId && req.user && req.user.username) {
      try {
        const foundUser = await User.findByUsername(req.user.username);
        if (foundUser && foundUser.id) userId = foundUser.id;
      } catch (e) {
        console.warn('[employer.updateMe] user lookup failed:', e.message);
      }
    }
    if (!userId) {
      console.warn('[employer.updateMe] unauthenticated: req.user=', req.user);
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const payload = { ...req.body };
    if (payload.employer_email && !payload.email) payload.email = payload.employer_email;

    // Upsert by authenticated user id; FE does not need to send user_id
    const existing = await Employer.findByUserId(userId);
    const employer = existing
      ? await Employer.update(userId, payload)
      : await Employer.create({ user_id: userId, ...payload });

    if (!employer) return res.status(400).json({ message: 'Update failed' });
    res.json({ message: existing ? 'Updated' : 'Created', employer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'currentPassword and newPassword required' });

    const user = await User.findByIdWithPassword(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Current password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hashed);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthenticated' });
    const emp = await Employer.findByUserId(userId);
    if (!emp) return res.status(404).json({ message: 'Employer profile not found' });
    const result = await Employer.delete(userId);
    res.json({ message: 'Employer profile deleted', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};