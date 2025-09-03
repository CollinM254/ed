// controllers/videoController.js
// const VideoCategory = require('../models/VideoCategory');
// const { uploadVideo } = require('../config/cloudinary');


// exports.uploadCategoryVideo = async (req, res) => {
//   try {
//     const { title, description, category } = req.body; // Removed adminId from destructuring

//     if (!req.file) {
//       return res.status(400).json({ message: 'No video file uploaded.' });
//     }

//     const video = new VideoCategory({
//       title,
//       description,
//       category,
//       videoUrl: req.file.path,
//       thumbnailUrl: req.file.path.replace(/(\.\w+)$/, '_thumb$1'),
//       uploadedBy: 'gov_admin' // Hardcoded value
//     });

//     await video.save();

//     res.status(201).json({ message: 'Video uploaded successfully!', video });
//   } catch (error) {
//     console.error('Error uploading video:', error);
//     res.status(500).json({ message: 'Internal server error.' });
//   }
// };
const VideoCategory = require('../models/VideoCategory');
const { uploadToCloudinary } = require('../config/cloudinary');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

// Admin uploads category video
exports.uploadCategoryVideo = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded.' });
    }

    // Validate file size (client-side validation should also be implemented)
    if (req.file.size > 50 * 1024 * 1024) { // 50MB limit
      await unlinkFile(req.file.path); // Remove the temporary file
      return res.status(413).json({ message: 'File size exceeds 50MB limit' });
    }

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(req.file.path, {
      resource_type: "video",
      folder: "category_videos",
    });

    // Create video document
    const video = new VideoCategory({
      title,
      description,
      category,
      videoUrl: cloudinaryResult.secure_url,
      thumbnailUrl: cloudinaryResult.thumbnail_url || cloudinaryResult.secure_url,
      uploadedBy: 'gov_admin',
      duration: cloudinaryResult.duration,
      format: cloudinaryResult.format,
      bytes: cloudinaryResult.bytes
    });

    await video.save();
    await unlinkFile(req.file.path); // Clean up temp file

    res.status(201).json({ 
      message: 'Video uploaded successfully!',
      video: {
        _id: video._id,
        title: video.title,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        category: video.category,
        uploadedAt: video.uploadedAt
      }
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    
    // Clean up temp file if it exists
    if (req.file?.path) {
      try {
        await unlinkFile(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }

    // Handle specific errors
    if (error.message.includes('File size too large')) {
      return res.status(413).json({ message: 'File size exceeds maximum limit' });
    }
    if (error.message.includes('invalid file type')) {
      return res.status(400).json({ message: 'Invalid video file format' });
    }

    res.status(500).json({ 
      message: 'Internal server error.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get videos by category on learner side
exports.getVideosByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const videos = await VideoCategory.find({ category })
      .sort({ uploadedAt: -1 })
      .populate('uploadedBy', 'fullName');
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Record video view
exports.recordVideoView = async (req, res) => {
  const { videoId } = req.params;

  try {
    await VideoCategory.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Toggle video like
exports.toggleVideoLike = async (req, res) => {
  const { videoId, learnerId } = req.params;

  try {
    const video = await VideoCategory.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const likeIndex = video.likedBy.indexOf(learnerId);
    let isLiked;

    if (likeIndex === -1) {
      // Like the video
      video.likedBy.push(learnerId);
      video.likes += 1;
      isLiked = true;
    } else {
      // Unlike the video
      video.likedBy.splice(likeIndex, 1);
      video.likes -= 1;
      isLiked = false;
    }

    await video.save();
    res.json({
      success: true,
      likes: video.likes,
      isLiked
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      message: 'Internal server error.',
      error: error.message
    });
  }
};
//check like status
exports.checkLikeStatus = async (req, res) => {
  const { videoId, learnerId } = req.params;

  try {
    const video = await VideoCategory.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json({
      isLiked: video.likedBy.includes(learnerId)
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// controllers/videoController.js
// Add this new method
// In your getAdminVideos controller
exports.getAdminVideos = async (req, res) => {
  try {
    console.log('Fetching admin videos for:', req.user); // Check if user is populated
    const videos = await VideoCategory.find({ uploadedBy: 'gov_admin' })
      .sort({ uploadedAt: -1 })
      .select('-likedBy');

    console.log('Query filter:', { uploadedBy: 'gov_admin' });
    console.log('Found videos:', videos);

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
};