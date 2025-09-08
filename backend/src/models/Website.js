const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid URL'
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  favicon: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['business', 'tech', 'finance', 'health', 'sports', 'entertainment', 'politics', 'science', 'other'],
    default: 'other'
  },
  monitoringFrequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly'],
    default: 'daily'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastChecked: {
    type: Date,
    default: null
  },
  lastContentHash: {
    type: String,
    default: null
  },
  contentExtractionRules: {
    titleSelector: {
      type: String,
      default: 'h1, .title, .headline'
    },
    contentSelector: {
      type: String,
      default: 'article, .content, .post-content, main'
    },
    excludeSelectors: {
      type: [String],
      default: ['nav', 'footer', '.advertisement', '.ads', '.sidebar']
    }
  },
  metadata: {
    language: {
      type: String,
      default: 'en'
    },
    lastModified: Date,
    contentLength: Number,
    wordCount: Number
  },
  statistics: {
    totalChecks: {
      type: Number,
      default: 0
    },
    successfulChecks: {
      type: Number,
      default: 0
    },
    failedChecks: {
      type: Number,
      default: 0
    },
    lastError: {
      message: String,
      timestamp: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
websiteSchema.index({ userId: 1, isActive: 1 });
websiteSchema.index({ url: 1 });
websiteSchema.index({ category: 1 });
websiteSchema.index({ lastChecked: 1 });
websiteSchema.index({ monitoringFrequency: 1, isActive: 1 });

// Virtual for success rate
websiteSchema.virtual('successRate').get(function() {
  if (this.statistics.totalChecks === 0) return 0;
  return (this.statistics.successfulChecks / this.statistics.totalChecks) * 100;
});

// Method to update statistics
websiteSchema.methods.updateStatistics = function(success, error = null) {
  this.statistics.totalChecks += 1;
  
  if (success) {
    this.statistics.successfulChecks += 1;
  } else {
    this.statistics.failedChecks += 1;
    if (error) {
      this.statistics.lastError = {
        message: error.message || error,
        timestamp: new Date()
      };
    }
  }
  
  this.lastChecked = new Date();
  return this.save();
};

// Method to check if website needs monitoring
websiteSchema.methods.needsMonitoring = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  const lastCheck = this.lastChecked || new Date(0);
  const frequencyMs = {
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000
  };
  
  return (now - lastCheck) >= frequencyMs[this.monitoringFrequency];
};

module.exports = mongoose.model('Website', websiteSchema);
