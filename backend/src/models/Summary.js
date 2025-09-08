const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  content: {
    original: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true,
      maxlength: [2000, 'Summary cannot exceed 2000 characters']
    },
    keyPoints: [{
      type: String,
      maxlength: [200, 'Key point cannot exceed 200 characters']
    }],
    wordCount: {
      original: Number,
      summary: Number
    }
  },
  classification: {
    tier: {
      type: String,
      enum: ['tier1', 'tier2'],
      required: true
    },
    category: {
      type: String,
      enum: ['business', 'tech', 'finance', 'health', 'sports', 'entertainment', 'politics', 'science', 'other'],
      required: true
    },
    tags: [String],
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },
  aiMetadata: {
    model: {
      type: String,
      default: 'gpt-4'
    },
    processingTime: Number,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    reasoning: String
  },
  userFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    isInterested: Boolean,
    feedback: String,
    feedbackTimestamp: Date
  },
  relatedSummaries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Summary'
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    required: true
  },
  extractedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
summarySchema.index({ userId: 1, isArchived: 1, publishedAt: -1 });
summarySchema.index({ websiteId: 1, publishedAt: -1 });
summarySchema.index({ 'classification.tier': 1, 'classification.category': 1 });
summarySchema.index({ 'classification.tags': 1 });
summarySchema.index({ publishedAt: -1 });
summarySchema.index({ extractedAt: -1 });

// Text index for search functionality
summarySchema.index({
  title: 'text',
  'content.summary': 'text',
  'content.keyPoints': 'text'
});

// Virtual for reading time estimate
summarySchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.summary.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Method to mark as read
summarySchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Method to add user feedback
summarySchema.methods.addFeedback = function(rating, isInterested, feedback = null) {
  this.userFeedback = {
    rating,
    isInterested,
    feedback,
    feedbackTimestamp: new Date()
  };
  return this.save();
};

// Static method to get summaries by date range
summarySchema.statics.getByDateRange = function(userId, startDate, endDate, options = {}) {
  const query = {
    userId,
    isArchived: false,
    publishedAt: {
      $gte: startDate,
      $lte: endDate
    }
  };

  if (options.tier) {
    query['classification.tier'] = options.tier;
  }

  if (options.category) {
    query['classification.category'] = options.category;
  }

  return this.find(query)
    .populate('websiteId', 'title url favicon category')
    .sort({ publishedAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get trending topics
summarySchema.statics.getTrendingTopics = function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        publishedAt: { $gte: startDate },
        isArchived: false
      }
    },
    {
      $unwind: '$classification.tags'
    },
    {
      $group: {
        _id: '$classification.tags',
        count: { $sum: 1 },
        avgRating: { $avg: '$userFeedback.rating' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 20
    }
  ]);
};

module.exports = mongoose.model('Summary', summarySchema);
