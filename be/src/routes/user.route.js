const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');


// profile (any authenticated user)
router.get('/me', authenticate, userCtrl.getProfile);


// admin-only: list users
router.get('/', authenticate, authorizeRole(['admin']), userCtrl.getAllUsers);


module.exports = router;