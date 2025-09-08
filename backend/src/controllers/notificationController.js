const User = require('../models/User');
const emailService = require('../services/emailService');

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // For now, we'll return a simple notification structure
    // In a full implementation, you'd have a Notification model
    const notifications = [
      {
        id: '1',
        type: 'summary',
        title: 'New summaries available',
        message: 'You have 5 new summaries from your tracked websites',
        isRead: false,
        createdAt: new Date()
      },
      {
        id: '2',
        type: 'system',
        title: 'Welcome to FocusCircle',
        message: 'Your account has been successfully created',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000)
      }
    ];

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: notifications.length,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a full implementation, you'd update the notification in the database
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    // In a full implementation, you'd update all notifications for the user
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a full implementation, you'd delete the notification from the database
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Get notification preferences
const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        preferences: user.preferences.notificationTypes,
        frequency: user.preferences.notificationFrequency
      }
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences',
      error: error.message
    });
  }
};

// Update notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const { notificationTypes, notificationFrequency } = req.body;
    const user = await User.findById(req.user._id);

    if (notificationTypes) {
      user.preferences.notificationTypes = {
        ...user.preferences.notificationTypes,
        ...notificationTypes
      };
    }

    if (notificationFrequency) {
      user.preferences.notificationFrequency = notificationFrequency;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: {
        preferences: user.preferences.notificationTypes,
        frequency: user.preferences.notificationFrequency
      }
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
};

// Send test notification
const sendTestNotification = async (req, res) => {
  try {
    const { type, email } = req.body;
    const user = await User.findById(req.user._id);

    if (type === 'email' && user.preferences.notificationTypes.email) {
      await emailService.sendEmail(
        email || user.email,
        'Test Notification - FocusCircle',
        '<h1>Test Notification</h1><p>This is a test notification from FocusCircle.</p>'
      );
    }

    res.json({
      success: true,
      message: 'Test notification sent successfully'
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification
};
