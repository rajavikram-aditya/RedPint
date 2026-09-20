const router = require('express').Router();
const { getMulterUploader } = require('../utils/uploader');
const { verifyToken, requireRole, requireVerified } = require('../middleware/auth');
const donorController = require('../controllers/donor.controller');

const upload = getMulterUploader('donors');

// POST /api/donors/register — register a new donor (with document upload)
router.post('/register', upload.single('document'), donorController.register);

// GET /api/donors — list all verified donors (hospital only)
router.get('/', verifyToken, requireRole('hospital'), requireVerified, donorController.getAllDonors);

// GET /api/donors/me/profile — get logged-in donor's profile
router.get('/me/profile', verifyToken, requireRole('donor'), donorController.getProfile);

// PATCH /api/donors/me/profile — update donor profile
router.patch('/me/profile', verifyToken, requireRole('donor'), donorController.updateProfile);

// GET /api/donors/me/matches — get donor's active matches
router.get('/me/matches', verifyToken, requireRole('donor'), donorController.getMyMatches);

module.exports = router;
