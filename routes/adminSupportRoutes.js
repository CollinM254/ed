//const express = require('express');
//const adminSupportController = require('../controllers/adminSupportController');
//const { verifyAdminToken } = require('../middleware/authMiddleware');
//const { verifySchoolToken } = require('../middleware/schoolAuthMiddleware');
//const router = express.Router();
//
//// School-facing routes
//router.post('/school/messages',  adminSupportController.createSchoolMessage);
//router.get('/school/messages',  adminSupportController.getSchoolMessages);
//router.get('/school/conversations',  adminSupportController.getSchoolConversations);
//
//// Admin-facing routes
//router.get('/admin/messages', verifyAdminToken, adminSupportController.getSupportMessages);
//router.get('/admin/conversations', verifyAdminToken, adminSupportController.getSupportConversations);
//router.post('/admin/mark-read', verifyAdminToken, adminSupportController.markSupportMessagesRead);
//
//module.exports = router;
//
// routes/adminSupportRoutes.js
const express = require('express');
const adminSupportController = require('../controllers/adminSupportController');
const router = express.Router();

// School-facing routes
router.post('/school/messages', adminSupportController.createSchoolMessage);
router.get('/school/messages', adminSupportController.getSchoolMessages);
router.get('/school/conversations', adminSupportController.getSchoolConversations);

// Admin-facing routes
router.get('/admin/messages', adminSupportController.getSupportMessages);
router.get('/admin/conversations', adminSupportController.getSupportConversations);
router.post('/admin/mark-read', adminSupportController.markSupportMessagesRead);
router.post('/admin/messages', adminSupportController.createAdminMessage);

module.exports = router;