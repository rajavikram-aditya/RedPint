const router = require('express').Router();
const { getMulterUploader } = require('../utils/uploader');
const { verifyToken, requireRole } = require('../middleware/auth');
const hospitalController = require('../controllers/hospital.controller');

const upload = getMulterUploader('hospitals');

// POST /api/hospitals/register — register a new hospital
router.post('/register', upload.single('license'), hospitalController.register);

// GET /api/hospitals — list all verified hospitals (public)
router.get('/', hospitalController.getAllHospitals);

// GET /api/hospitals/me/profile — get logged-in hospital's profile
router.get('/me/profile', verifyToken, requireRole('hospital'), hospitalController.getProfile);

// PATCH /api/hospitals/me/profile — update hospital profile
router.patch('/me/profile', verifyToken, requireRole('hospital'), hospitalController.updateProfile);

module.exports = router;
