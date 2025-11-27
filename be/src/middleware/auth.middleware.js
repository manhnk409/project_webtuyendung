const jwt = require('jsonwebtoken');


exports.authenticate = (req, res, next) => {
const authHeader = req.headers.authorization;
if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });


const parts = authHeader.split(' ');
if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid Authorization format' });


const token = parts[1];
try {
const payload = jwt.verify(token, process.env.JWT_SECRET);
req.user = payload; // { id, username, role }
next();
} catch (err) {
return res.status(401).json({ message: 'Invalid or expired token' });
}
};


exports.authorizeRole = (roles = []) => (req, res, next) => {
// roles can be a single role string or array
const allowed = Array.isArray(roles) ? roles : [roles];
if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
if (!allowed.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden: insufficient role' });
next();
};