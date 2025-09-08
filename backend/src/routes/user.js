const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validatePasswordUpdate, validatePagination } = require('../middleware/validation');

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', validatePasswordUpdate, userController.updatePassword);
router.put('/preferences', userController.updatePreferences);

// User statistics
router.get('/stats', userController.getUserStats);
router.get('/activity', validatePagination, userController.getUserActivity);

// User data management
router.get('/export', userController.exportUserData);
router.delete('/account', userController.deleteAccount);

module.exports = router;
