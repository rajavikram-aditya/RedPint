const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

// POST /api/auth/verify — mark user as verified after OTP
router.post('/verify', verifyToken, authController.verifyUser);

// GET /api/auth/me — get current user profile
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
