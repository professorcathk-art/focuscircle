const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summaryController');
const {
  validateSummaryFeedback,
  validatePagination,
  validateDateRange
} = require('../middleware/validation');

// Summary retrieval
router.get('/', validatePagination, validateDateRange, summaryController.getSummaries);
router.get('/trending', summaryController.getTrendingTopics);
router.get('/search', summaryController.searchSummaries);
router.get('/:id', summaryController.getSummary);

// User interactions
router.put('/:id/read', summaryController.markAsRead);
router.put('/:id/feedback', validateSummaryFeedback, summaryController.addFeedback);
router.put('/:id/archive', summaryController.archiveSummary);

// Summary management
router.get('/:id/related', summaryController.getRelatedSummaries);
router.post('/:id/share', summaryController.shareSummary);

// Analytics
router.get('/analytics/overview', summaryController.getAnalyticsOverview);
router.get('/analytics/categories', summaryController.getCategoryAnalytics);

module.exports = router;
