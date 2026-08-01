const Notification = require('../models/Notification');
const { asyncHandler } = require('../utils/helpers');

/**
 * GET /api/notifications
 * Get notifications for the logged-in user.
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    userId: req.userProfile._id,
    userType: req.userRole,
  }).sort({ createdAt: -1 });

  res.json({ success: true, notifications });
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read.
 */
exports.markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.userProfile._id,
    },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.json({ success: true, notification });
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read.
 */
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.userProfile._id, userType: req.userRole, read: false },
    { read: true }
  );

  res.json({ success: true, message: 'All notifications marked as read' });
});
