const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const driveController = require('../controllers/drive.controller');

// POST /api/drives — hospital creates a blood drive
router.post('/', verifyToken, requireRole('hospital'), driveController.createDrive);

// GET /api/drives — list all upcoming drives (public)
router.get('/', driveController.getDrives);

// GET /api/drives/:id — get a single drive
router.get('/:id', driveController.getDrive);

module.exports = router;
