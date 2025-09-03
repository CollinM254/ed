// routes/adminChatRoutes.js
const express = require('express');
const router = express.Router();
const adminChatController = require('../controllers/adminChatController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

// Get all admin conversations
router.get('/conversations', verifyAdminToken, adminChatController.getAdminConversations);

// Get messages with specific school
router.get('/messages/:schoolId', verifyAdminToken, adminChatController.getAdminMessages);

// Send message to school
router.post('/send-message', verifyAdminToken, adminChatController.sendAdminMessage);

module.exports = router;