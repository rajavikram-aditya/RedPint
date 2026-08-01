const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

// GET /api/notifications — get user's notifications
router.get('/', verifyToken, notificationController.getNotifications);

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', verifyToken, notificationController.markRead);

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', verifyToken, notificationController.markAllRead);

module.exports = router;
