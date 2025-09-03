// routes/schoolChatRoutes.js
const express = require('express');
const router = express.Router();
const schoolChatController = require('../controllers/schoolChatController');


router.get('/conversations',  schoolChatController.getSchoolConversations);
router.post('/send-message',  schoolChatController.sendSchoolMessage);

module.exports = router;