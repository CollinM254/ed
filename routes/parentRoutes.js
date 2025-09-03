const express = require('express');
const parentController = require('../controllers/parentController');
const router = express.Router();

// Get parent profile
router.get('/:parentId', parentController.getParentProfile);

// Update parent profile
router.patch('/:parentId', parentController.updateParentProfile);

module.exports = router;