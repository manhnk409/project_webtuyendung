const jwt = require('jsonwebtoken');
const User = require('../models/user.model');


exports.authenticate = async (req, res, next) => {
	const authHeader = req.headers.authorization;
	// Debug: log whether header is present (do not log full token in production)
	if (!authHeader) {
		console.warn('[auth] Missing Authorization header');
		return res.status(401).json({ message: 'Missing Authorization header' });
	}

	// small safety: show only prefix of token for debugging
	try {
		const parts = authHeader.split(' ');
		if (parts.length !== 2 || parts[0] !== 'Bearer') {
			console.warn('[auth] Invalid Authorization format:', authHeader.slice(0, 32));
			return res.status(401).json({ message: 'Invalid Authorization format' });
		}

		const token = parts[1];
		// Debug: log token info (length and segment count) to help diagnose malformed errors
		try {
			const segs = typeof token === 'string' ? token.split('.') : [];
			console.warn('[auth] token debug: len=%d segments=%d prefix=%s suffix=%s', token.length, segs.length, token.slice(0,8), token.slice(-8));
		} catch (dbgErr) {
			console.warn('[auth] token debug failed:', dbgErr.message);
		}

		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET);
			req.user = payload; // may contain { id, username, role }

			// If token payload lacks an id, try to look up user by username and attach id
			try {
				if ((!req.user || !req.user.id) && req.user && req.user.username) {
					const found = await User.findByUsername(req.user.username);
					if (found) {
						// support multiple possible id column names
						const resolvedId = found.id || found.user_id || found.ID || found.userId;
						if (resolvedId) req.user.id = resolvedId;
					}
				}
			} catch (lookupErr) {
				console.warn('[auth] user lookup failed:', lookupErr.message);
			}

			return next();
		} catch (err) {
			console.warn('[auth] JWT verify failed:', err.message);
			return res.status(401).json({ message: 'Invalid or expired token' });
		}
	} catch (err) {
		console.error('[auth] Unexpected error parsing Authorization header', err);
		return res.status(401).json({ message: 'Invalid Authorization format' });
	}
};


exports.authorizeRole = (roles = []) => (req, res, next) => {
// roles can be a single role string or array
const allowed = Array.isArray(roles) ? roles : [roles];
// Debug log to help diagnose role issues (temporary)
console.log('[authorizeRole] allowed=', allowed, ' req.user=', req.user);
if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden: insufficient role' });
next();
};
