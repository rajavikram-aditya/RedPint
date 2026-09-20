const router = require('express').Router();
const { verifyToken, requireRole, requireVerified } = require('../middleware/auth');
const driveController = require('../controllers/drive.controller');

// POST /api/drives — hospital creates a blood drive
router.post('/', verifyToken, requireRole('hospital'), requireVerified, driveController.createDrive);

// GET /api/drives — list all upcoming drives
router.get('/', verifyToken, driveController.getDrives);

// GET /api/drives/:id — get a single drive
router.get('/:id', verifyToken, driveController.getDrive);

// POST /api/drives/:id/register — donor registers for a drive
router.post('/:id/register', verifyToken, requireRole('donor'), driveController.registerForDrive);

module.exports = router;
