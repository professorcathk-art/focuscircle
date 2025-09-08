const Summary = require('../models/Summary');
const Website = require('../models/Website');
const aiService = require('../services/aiService');

// Get summaries with filtering and pagination
const getSummaries = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { userId, isArchived: false };
    
    if (req.query.tier) {
      query['classification.tier'] = req.query.tier;
    }
    
    if (req.query.category) {
      query['classification.category'] = req.query.category;
    }
    
    if (req.query.isRead !== undefined) {
      query.isRead = req.query.isRead === 'true';
    }
    
    if (req.query.startDate && req.query.endDate) {
      query.publishedAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const summaries = await Summary.find(query)
      .populate('websiteId', 'title url favicon category')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Summary.countDocuments(query);

    res.json({
      success: true,
      data: {
        summaries,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get summaries',
      error: error.message
    });
  }
};

// Get single summary
const getSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const summary = await Summary.findOne({ _id: id, userId })
      .populate('websiteId', 'title url favicon category');

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get summary',
      error: error.message
    });
  }
};

// Mark summary as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const summary = await Summary.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    res.json({
      success: true,
      message: 'Summary marked as read',
      data: { summary }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark summary as read',
      error: error.message
    });
  }
};

// Add user feedback to summary
const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { rating, isInterested, feedback } = req.body;

    const summary = await Summary.findOne({ _id: id, userId });
    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    // Add feedback
    await summary.addFeedback(rating, isInterested, feedback);

    // Update user learning data
    const user = req.user;
    if (isInterested && summary.classification.tags) {
      user.learningData.interestedTopics = [
        ...new Set([...user.learningData.interestedTopics, ...summary.classification.tags])
      ];
    } else if (!isInterested && summary.classification.tags) {
      user.learningData.uninterestedTopics = [
        ...new Set([...user.learningData.uninterestedTopics, ...summary.classification.tags])
      ];
    }

    if (rating >= 4 && summary.classification.tier === 'tier1') {
      user.learningData.tier1Keywords = [
        ...new Set([...user.learningData.tier1Keywords, ...summary.classification.tags])
      ];
    }

    await user.save();

    // Record feedback for AI improvement
    await aiService.improveSummaryWithFeedback(id, { rating, isInterested, feedback });

    res.json({
      success: true,
      message: 'Feedback added successfully',
      data: { summary }
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add feedback',
      error: error.message
    });
  }
};

// Archive summary
const archiveSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const summary = await Summary.findOneAndUpdate(
      { _id: id, userId },
      { isArchived: true },
      { new: true }
    );

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    res.json({
      success: true,
      message: 'Summary archived successfully',
      data: { summary }
    });
  } catch (error) {
    console.error('Archive summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive summary',
      error: error.message
    });
  }
};

// Get related summaries
const getRelatedSummaries = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;

    const summary = await Summary.findOne({ _id: id, userId });
    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    // Find related summaries based on tags and category
    const relatedSummaries = await Summary.find({
      _id: { $ne: id },
      userId,
      isArchived: false,
      $or: [
        { 'classification.tags': { $in: summary.classification.tags } },
        { 'classification.category': summary.classification.category }
      ]
    })
    .populate('websiteId', 'title url favicon category')
    .sort({ publishedAt: -1 })
    .limit(limit);

    res.json({
      success: true,
      data: { relatedSummaries }
    });
  } catch (error) {
    console.error('Get related summaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get related summaries',
      error: error.message
    });
  }
};

// Search summaries
const searchSummaries = async (req, res) => {
  try {
    const userId = req.user._id;
    const { q: query, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery = {
      userId,
      isArchived: false,
      $text: { $search: query.trim() }
    };

    const summaries = await Summary.find(searchQuery, { score: { $meta: 'textScore' } })
      .populate('websiteId', 'title url favicon category')
      .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Summary.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        summaries,
        query: query.trim(),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search summaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search summaries',
      error: error.message
    });
  }
};

// Get trending topics
const getTrendingTopics = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 7;

    const trendingTopics = await Summary.getTrendingTopics(userId, days);

    res.json({
      success: true,
      data: { trendingTopics }
    });
  } catch (error) {
    console.error('Get trending topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending topics',
      error: error.message
    });
  }
};

// Get analytics overview
const getAnalyticsOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalSummaries,
      tier1Count,
      tier2Count,
      readCount,
      categoryStats,
      dailyStats
    ] = await Promise.all([
      Summary.countDocuments({ userId, isArchived: false }),
      Summary.countDocuments({ userId, isArchived: false, 'classification.tier': 'tier1' }),
      Summary.countDocuments({ userId, isArchived: false, 'classification.tier': 'tier2' }),
      Summary.countDocuments({ userId, isArchived: false, isRead: true }),
      Summary.aggregate([
        { $match: { userId, isArchived: false, publishedAt: { $gte: startDate } } },
        { $group: { _id: '$classification.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Summary.aggregate([
        { $match: { userId, isArchived: false, publishedAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' } },
            count: { $sum: 1 },
            tier1Count: { $sum: { $cond: [{ $eq: ['$classification.tier', 'tier1'] }, 1, 0] } },
            tier2Count: { $sum: { $cond: [{ $eq: ['$classification.tier', 'tier2'] }, 1, 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalSummaries,
          tier1Count,
          tier2Count,
          readCount,
          unreadCount: totalSummaries - readCount,
          readRate: totalSummaries > 0 ? (readCount / totalSummaries * 100).toFixed(1) : 0
        },
        categoryDistribution: categoryStats,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics overview',
      error: error.message
    });
  }
};

// Get category analytics
const getCategoryAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category } = req.params;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const categoryStats = await Summary.aggregate([
      {
        $match: {
          userId,
          isArchived: false,
          'classification.category': category,
          publishedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          tier1Count: { $sum: { $cond: [{ $eq: ['$classification.tier', 'tier1'] }, 1, 0] } },
          tier2Count: { $sum: { $cond: [{ $eq: ['$classification.tier', 'tier2'] }, 1, 0] } },
          avgRating: { $avg: '$userFeedback.rating' },
          readCount: { $sum: { $cond: ['$isRead', 1, 0] } }
        }
      }
    ]);

    const topTags = await Summary.aggregate([
      {
        $match: {
          userId,
          isArchived: false,
          'classification.category': category,
          publishedAt: { $gte: startDate }
        }
      },
      { $unwind: '$classification.tags' },
      { $group: { _id: '$classification.tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        category,
        stats: categoryStats[0] || {
          totalCount: 0,
          tier1Count: 0,
          tier2Count: 0,
          avgRating: 0,
          readCount: 0
        },
        topTags
      }
    });
  } catch (error) {
    console.error('Get category analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category analytics',
      error: error.message
    });
  }
};

module.exports = {
  getSummaries,
  getSummary,
  markAsRead,
  addFeedback,
  archiveSummary,
  getRelatedSummaries,
  searchSummaries,
  getTrendingTopics,
  getAnalyticsOverview,
  getCategoryAnalytics
};
