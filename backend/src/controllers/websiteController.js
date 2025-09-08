const Website = require('../models/Website');
const Summary = require('../models/Summary');
const contentExtractionService = require('../services/contentExtractionService');
const aiService = require('../services/aiService');

// Get all websites for user
const getWebsites = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const isActive = req.query.isActive;

    const query = { userId };
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const websites = await Website.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Website.countDocuments(query);

    res.json({
      success: true,
      data: {
        websites,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get websites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get websites',
      error: error.message
    });
  }
};

// Create new website
const createWebsite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { url, title, description, category, monitoringFrequency } = req.body;

    // Check if website already exists for user
    const existingWebsite = await Website.findOne({ userId, url });
    if (existingWebsite) {
      return res.status(400).json({
        success: false,
        message: 'Website is already being tracked'
      });
    }

    // Extract website metadata
    let websiteData = {
      userId,
      url,
      title: title || 'Loading...',
      description: description || '',
      category: category || 'other',
      monitoringFrequency: monitoringFrequency || 'daily'
    };

    try {
      const metadata = await contentExtractionService.extractWebsiteMetadata(url);
      websiteData = { ...websiteData, ...metadata };
    } catch (extractionError) {
      console.warn('Failed to extract metadata for:', url, extractionError.message);
      // Continue with basic data if extraction fails
    }

    const website = await Website.create(websiteData);

    res.status(201).json({
      success: true,
      message: 'Website added successfully',
      data: { website }
    });
  } catch (error) {
    console.error('Create website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add website',
      error: error.message
    });
  }
};

// Get single website
const getWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const website = await Website.findOne({ _id: id, userId });
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    res.json({
      success: true,
      data: { website }
    });
  } catch (error) {
    console.error('Get website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get website',
      error: error.message
    });
  }
};

// Update website
const updateWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const website = await Website.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    res.json({
      success: true,
      message: 'Website updated successfully',
      data: { website }
    });
  } catch (error) {
    console.error('Update website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update website',
      error: error.message
    });
  }
};

// Delete website
const deleteWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const website = await Website.findOneAndDelete({ _id: id, userId });
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Also delete related summaries
    await Summary.deleteMany({ userId, websiteId: id });

    res.json({
      success: true,
      message: 'Website deleted successfully'
    });
  } catch (error) {
    console.error('Delete website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete website',
      error: error.message
    });
  }
};

// Bulk import websites
const bulkImportWebsites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { websites } = req.body;

    if (!Array.isArray(websites) || websites.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Websites array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const websiteData of websites) {
      try {
        const { url, title, description, category, monitoringFrequency } = websiteData;
        
        // Check if website already exists
        const existingWebsite = await Website.findOne({ userId, url });
        if (existingWebsite) {
          errors.push({ url, error: 'Website already exists' });
          continue;
        }

        const website = await Website.create({
          userId,
          url,
          title: title || 'Loading...',
          description: description || '',
          category: category || 'other',
          monitoringFrequency: monitoringFrequency || 'daily'
        });

        results.push(website);
      } catch (error) {
        errors.push({ url: websiteData.url, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Imported ${results.length} websites successfully`,
      data: {
        imported: results,
        errors
      }
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import websites',
      error: error.message
    });
  }
};

// Test website
const testWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const website = await Website.findOne({ _id: id, userId });
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    const testResult = await contentExtractionService.testWebsite(website.url);
    
    res.json({
      success: true,
      data: { testResult }
    });
  } catch (error) {
    console.error('Test website error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test website',
      error: error.message
    });
  }
};

// Get website status
const getWebsiteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const website = await Website.findOne({ _id: id, userId });
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    const status = {
      isActive: website.isActive,
      lastChecked: website.lastChecked,
      successRate: website.successRate,
      needsMonitoring: website.needsMonitoring(),
      statistics: website.statistics
    };

    res.json({
      success: true,
      data: { status }
    });
  } catch (error) {
    console.error('Get website status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get website status',
      error: error.message
    });
  }
};

// Manual check website
const manualCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const website = await Website.findOne({ _id: id, userId });
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Perform content extraction and summarization
    const result = await contentExtractionService.extractContent(website.url);
    
    if (result.success) {
      // Check if content has changed
      const contentHash = require('crypto')
        .createHash('md5')
        .update(result.content)
        .digest('hex');

      if (contentHash !== website.lastContentHash) {
        // Generate summary
        const summary = await aiService.generateSummary(
          result.title,
          result.content,
          website.category
        );

        // Create summary record
        const summaryRecord = await Summary.create({
          userId,
          websiteId: website._id,
          originalUrl: website.url,
          title: result.title,
          content: {
            original: result.content,
            summary: summary.summary,
            keyPoints: summary.keyPoints,
            wordCount: {
              original: result.content.split(' ').length,
              summary: summary.summary.split(' ').length
            }
          },
          classification: summary.classification,
          aiMetadata: summary.metadata,
          publishedAt: new Date()
        });

        // Update website
        website.lastContentHash = contentHash;
        await website.updateStatistics(true);

        res.json({
          success: true,
          message: 'Website checked successfully',
          data: {
            hasNewContent: true,
            summary: summaryRecord
          }
        });
      } else {
        await website.updateStatistics(true);
        res.json({
          success: true,
          message: 'Website checked successfully',
          data: {
            hasNewContent: false
          }
        });
      }
    } else {
      await website.updateStatistics(false, result.error);
      res.status(400).json({
        success: false,
        message: 'Failed to check website',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Manual check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check website',
      error: error.message
    });
  }
};

// Get website statistics
const getWebsiteStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const website = await Website.findOne({ _id: id, userId });
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Get summary statistics for this website
    const summaryStats = await Summary.aggregate([
      { $match: { userId, websiteId: website._id } },
      {
        $group: {
          _id: null,
          totalSummaries: { $sum: 1 },
          avgRating: { $avg: '$userFeedback.rating' },
          tier1Count: {
            $sum: { $cond: [{ $eq: ['$classification.tier', 'tier1'] }, 1, 0] }
          },
          tier2Count: {
            $sum: { $cond: [{ $eq: ['$classification.tier', 'tier2'] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = summaryStats[0] || {
      totalSummaries: 0,
      avgRating: 0,
      tier1Count: 0,
      tier2Count: 0
    };

    res.json({
      success: true,
      data: {
        website: {
          id: website._id,
          title: website.title,
          url: website.url,
          category: website.category,
          isActive: website.isActive,
          lastChecked: website.lastChecked,
          successRate: website.successRate
        },
        statistics: {
          ...stats,
          websiteStats: website.statistics
        }
      }
    });
  } catch (error) {
    console.error('Get website stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get website statistics',
      error: error.message
    });
  }
};

module.exports = {
  getWebsites,
  createWebsite,
  getWebsite,
  updateWebsite,
  deleteWebsite,
  bulkImportWebsites,
  testWebsite,
  getWebsiteStatus,
  manualCheck,
  getWebsiteStats
};
