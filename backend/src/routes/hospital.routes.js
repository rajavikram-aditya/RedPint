const router = require('express').Router();
const multer = require('multer');
const { verifyToken, requireRole } = require('../middleware/auth');
const hospitalController = require('../controllers/hospital.controller');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/hospitals/register — register a new hospital
router.post('/register', verifyToken, upload.single('license'), hospitalController.register);

// GET /api/hospitals — list all verified hospitals (public)
router.get('/', hospitalController.getAllHospitals);

// GET /api/hospitals/me/profile — get logged-in hospital's profile
router.get('/me/profile', verifyToken, requireRole('hospital'), hospitalController.getProfile);

// PATCH /api/hospitals/me/profile — update hospital profile
router.patch('/me/profile', verifyToken, requireRole('hospital'), hospitalController.updateProfile);

// PATCH /api/hospitals/:id/verify — admin verifies a hospital
router.patch('/:id/verify', verifyToken, hospitalController.verifyHospital);

module.exports = router;
