const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');
const {
  validateWebsiteCreation,
  validateWebsiteUpdate,
  validatePagination
} = require('../middleware/validation');

// Website CRUD operations
router.get('/', validatePagination, websiteController.getWebsites);
router.post('/', validateWebsiteCreation, websiteController.createWebsite);
router.get('/:id', websiteController.getWebsite);
router.put('/:id', validateWebsiteUpdate, websiteController.updateWebsite);
router.delete('/:id', websiteController.deleteWebsite);

// Bulk operations
router.post('/bulk-import', websiteController.bulkImportWebsites);
router.post('/bulk-update', websiteController.bulkUpdateWebsites);

// Website monitoring
router.post('/:id/test', websiteController.testWebsite);
router.get('/:id/status', websiteController.getWebsiteStatus);
router.post('/:id/check', websiteController.manualCheck);

// Website statistics
router.get('/:id/stats', websiteController.getWebsiteStats);

module.exports = router;
