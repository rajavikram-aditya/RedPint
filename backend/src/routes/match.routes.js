const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const matchController = require('../controllers/match.controller');

// PATCH /api/matches/:id/respond — donor accepts or declines a match
router.patch('/:id/respond', verifyToken, requireRole('donor'), matchController.respondToMatch);

module.exports = router;
