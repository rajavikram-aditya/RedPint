const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

// All routes require a valid token and the 'admin' role
// GET /api/admin/me — return the admin's own profile
router.get('/me', verifyToken, requireRole('admin'), adminController.getMe);

// GET /api/admin/hospitals/pending — list hospitals awaiting approval
router.get('/hospitals/pending', verifyToken, requireRole('admin'), adminController.getPendingHospitals);

// PATCH /api/admin/hospitals/:id/verify — approve a hospital
router.patch('/hospitals/:id/verify', verifyToken, requireRole('admin'), adminController.verifyHospital);

// PATCH /api/admin/hospitals/:id/reject — soft-reject a hospital
router.patch('/hospitals/:id/reject', verifyToken, requireRole('admin'), adminController.rejectHospital);

// GET /api/admin/stats — platform-wide aggregate counts
router.get('/stats', verifyToken, requireRole('admin'), adminController.getStats);

module.exports = router;
