const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { validatePagination } = require('../middleware/validation');

// Notification management
router.get('/', validatePagination, notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

// Notification preferences
router.get('/preferences', notificationController.getNotificationPreferences);
router.put('/preferences', notificationController.updateNotificationPreferences);

// Notification testing
router.post('/test', notificationController.sendTestNotification);

module.exports = router;
