const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const driveController = require('../controllers/drive.controller');

// POST /api/drives — hospital creates a blood drive
router.post('/', verifyToken, requireRole('hospital'), driveController.createDrive);

// GET /api/drives — list all upcoming drives (public)
router.get('/', driveController.getDrives);

// GET /api/drives/:id — get a single drive
router.get('/:id', driveController.getDrive);

// POST /api/drives/:id/register — donor registers for a drive
router.post('/:id/register', verifyToken, requireRole('donor'), driveController.registerForDrive);

module.exports = router;
