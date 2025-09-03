// routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { uploadVideo } = require('../config/cloudinary');
const { verifyAdminToken } = require('../middleware/authMiddleware');

// Admin routes
router.post(
  '/admin/videos/category',
  verifyAdminToken,
  uploadVideo.single('video'),
  videoController.uploadCategoryVideo
);

// Public routes
router.get('/videos/category/:category', videoController.getVideosByCategory);
router.post('/videos/:videoId/view', videoController.recordVideoView);
router.post('/videos/:videoId/like/:learnerId', videoController.toggleVideoLike);
router.get('/videos/:videoId/like-status/:learnerId', videoController.checkLikeStatus);
router.get(
  '/admin/my-videos',
  verifyAdminToken,
  videoController.getAdminVideos
);
module.exports = router;