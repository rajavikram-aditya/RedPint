const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const donationController = require('../controllers/donation.controller');

// POST /api/donations — hospital records a completed donation
router.post('/', verifyToken, requireRole('hospital'), donationController.recordDonation);

// GET /api/donations — get donation history (role-aware)
router.get('/', verifyToken, donationController.getDonations);

module.exports = router;
