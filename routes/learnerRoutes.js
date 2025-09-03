// routes/learnerRoutes.js
const express = require('express');
const learnerController = require('../controllers/learnerController');
const router = express.Router();

// Get learner details
router.get('/:learnerId', learnerController.getLearnerById);

module.exports = router;