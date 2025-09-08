const User = require('../models/User');
const Website = require('../models/Website');
const Summary = require('../models/Summary');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, timezone } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (timezone) user.preferences.timezone = timezone;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message
    });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  try {
    const { notificationFrequency, notificationTypes, contentCategories } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (notificationFrequency) {
      user.preferences.notificationFrequency = notificationFrequency;
    }
    
    if (notificationTypes) {
      user.preferences.notificationTypes = {
        ...user.preferences.notificationTypes,
        ...notificationTypes
      };
    }
    
    if (contentCategories) {
      user.preferences.contentCategories = contentCategories;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: user.preferences }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get basic counts
    const [websiteCount, summaryCount, unreadCount] = await Promise.all([
      Website.countDocuments({ userId, isActive: true }),
      Summary.countDocuments({ userId, isArchived: false }),
      Summary.countDocuments({ userId, isArchived: false, isRead: false })
    ]);

    // Get recent activity
    const recentSummaries = await Summary.find({ userId, isArchived: false })
      .sort({ publishedAt: -1 })
      .limit(5)
      .populate('websiteId', 'title url category');

    // Get category distribution
    const categoryStats = await Summary.aggregate([
      { $match: { userId, isArchived: false } },
      { $group: { _id: '$classification.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get tier distribution
    const tierStats = await Summary.aggregate([
      { $match: { userId, isArchived: false } },
      { $group: { _id: '$classification.tier', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalWebsites: websiteCount,
          totalSummaries: summaryCount,
          unreadSummaries: unreadCount
        },
        recentActivity: recentSummaries,
        categoryDistribution: categoryStats,
        tierDistribution: tierStats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message
    });
  }
};

// Get user activity
const getUserActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const activities = await Summary.find({ userId, isArchived: false })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('websiteId', 'title url favicon category');

    const total = await Summary.countDocuments({ userId, isArchived: false });

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activity',
      error: error.message
    });
  }
};

// Export user data
const exportUserData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [user, websites, summaries] = await Promise.all([
      User.findById(userId).select('-password'),
      Website.find({ userId }),
      Summary.find({ userId })
    ]);

    const exportData = {
      user: {
        profile: user,
        exportDate: new Date().toISOString()
      },
      websites,
      summaries: summaries.map(summary => ({
        ...summary.toObject(),
        websiteTitle: summary.websiteId?.title || 'Unknown'
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="focuscircle-export-${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user data',
      error: error.message
    });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Delete all user data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Website.deleteMany({ userId }),
      Summary.deleteMany({ userId })
    ]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  updatePreferences,
  getUserStats,
  getUserActivity,
  exportUserData,
  deleteAccount
};
