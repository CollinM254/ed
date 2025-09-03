// const express = require('express');
// const router = express.Router();
// const teacherResourceController = require('../controllers/teacherResourceController');
// const { uploadNotes } = require('../config/cloudinary');
// const { verifyAdminToken } = require('../middleware/authMiddleware');

// // Admin routes - require admin authentication
// router.post('/upload', verifyAdminToken, uploadNotes.single('file'), teacherResourceController.uploadResource);
// router.delete('/:resourceId', verifyAdminToken, teacherResourceController.deleteResource);

// // Teacher routes - no authentication required (or use teacher auth if needed)
// router.get('/', teacherResourceController.getResources);
// router.get('/grouped', teacherResourceController.getResourcesGrouped);

// module.exports = router;

const express = require('express');
const router = express.Router();
const teacherResourceController = require('../controllers/teacherResourceController');
const { uploadNotes } = require('../config/cloudinary');
const { verifyAdminToken } = require('../middleware/authMiddleware');

// Admin routes - require admin authentication
router.post('/upload', verifyAdminToken, uploadNotes.single('file'), teacherResourceController.uploadTeacherResource);
router.delete('/:resourceId', verifyAdminToken, teacherResourceController.deleteResource);

// Teacher routes - no authentication required (or use teacher auth if needed)
router.get('/', teacherResourceController.getAllTeacherResources);
router.get('/grouped', teacherResourceController.getResourcesGrouped);

// Add these new endpoints
router.get('/filter', teacherResourceController.getResourcesByFilter);
router.get('/categories', teacherResourceController.getResourceCategories);
router.get('/download/:id', teacherResourceController.getDownloadUrl);
// router.get('/download-direct/:id', teacherResourceController.downloadResourceDirect);
router.get('/direct-download/:id', teacherResourceController.downloadResource);

module.exports = router;