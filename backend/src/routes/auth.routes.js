const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

// POST /api/auth/login — authenticate with email and password
router.post('/login', authController.login);

// GET /api/auth/me — get current user profile
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
