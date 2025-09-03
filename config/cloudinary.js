//
//
//const cloudinary = require('cloudinary').v2;
//const { CloudinaryStorage } = require('multer-storage-cloudinary');
//const multer = require('multer');
//
//// Configure Cloudinary
//cloudinary.config({
//  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//  api_key: process.env.CLOUDINARY_API_KEY,
//  api_secret: process.env.CLOUDINARY_API_SECRET,
//  secure: true
//});
//
//// Storage configuration for VIDEOS
//const videoStorage = new CloudinaryStorage({
//  cloudinary: cloudinary,
//  params: {
//    folder: 'kids_matter_videos',
//    resource_type: 'video',
//    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'flv', 'webm'],
//    format: 'mp4',
//  }
//});
//
//// Storage configuration for NOTES (PDFs, DOCs, Images)
//const notesStorage = new CloudinaryStorage({
//  cloudinary: cloudinary,
//  params: {
//    folder: 'kids_matter_notes',
//    resource_type: 'auto', // Auto-detect resource type
//    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
//  }
//});
//
//// Multer upload for videos
//const uploadVideo = multer({
//  storage: videoStorage,
//  limits: {
//    fileSize: 50 * 1024 * 1024 // 50MB for videos
//  },
//  fileFilter: (req, file, cb) => {
//    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/x-flv', 'video/webm'];
//    if (allowedTypes.includes(file.mimetype)) {
//      cb(null, true);
//    } else {
//      cb(new Error('Invalid video format. Only MP4, MOV, AVI, MKV, FLV, and WebM are allowed.'), false);
//    }
//  }
//});
//
//// Multer upload for notes
//const uploadNotes = multer({
//  storage: notesStorage,
//  limits: {
//    fileSize: 10 * 1024 * 1024 // 10MB for notes
//  },
//  fileFilter: (req, file, cb) => {
//    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//    if (allowedTypes.includes(file.mimetype)) {
//      cb(null, true);
//    } else {
//      cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'), false);
//    }
//  }
//});
//
//module.exports = {
//  cloudinary,
//  videoStorage,
//  notesStorage,
//  uploadVideo,
//  uploadNotes
//};





//const cloudinary = require('cloudinary').v2;
//const { CloudinaryStorage } = require('multer-storage-cloudinary');
//const multer = require('multer');
//
//// Configure Cloudinary
//cloudinary.config({
//  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//  api_key: process.env.CLOUDINARY_API_KEY,
//  api_secret: process.env.CLOUDINARY_API_SECRET,
//  secure: true
//});
//
//// Storage configuration for VIDEOS
//const videoStorage = new CloudinaryStorage({
//  cloudinary: cloudinary,
//  params: {
//    folder: 'kids_matter_videos',
//    resource_type: 'video',
//    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'flv', 'webm'],
//    format: 'mp4',
//  }
//});
//
//// Storage configuration for NOTES (PDFs, DOCs, Images)
//const notesStorage = new CloudinaryStorage({
//  cloudinary: cloudinary,
//  params: {
//    folder: 'kids_matter_notes',
//    resource_type: 'auto', // Auto-detect resource type
//    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
//  }
//});
//
//// Storage configuration for POST IMAGES
//const postImagesStorage = new CloudinaryStorage({
//  cloudinary: cloudinary,
//  params: {
//    folder: 'kids_matter_posts',
//    resource_type: 'image',
//    allowed_formats: ['jpg', 'jpeg', 'png'],
//    transformation: [{ width: 800, height: 600, crop: 'limit' }]
//  }
//});
//
//// Multer upload for videos
//const uploadVideo = multer({
//  storage: videoStorage,
//  limits: {
//    fileSize: 50 * 1024 * 1024 // 50MB for videos
//  },
//  fileFilter: (req, file, cb) => {
//    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/x-flv', 'video/webm'];
//    if (allowedTypes.includes(file.mimetype)) {
//      cb(null, true);
//    } else {
//      cb(new Error('Invalid video format. Only MP4, MOV, AVI, MKV, FLV, and WebM are allowed.'), false);
//    }
//  }
//});
//
//// Multer upload for notes
//const uploadNotes = multer({
//  storage: notesStorage,
//  limits: {
//    fileSize: 10 * 1024 * 1024 // 10MB for notes
//  },
//  fileFilter: (req, file, cb) => {
//    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//    if (allowedTypes.includes(file.mimetype)) {
//      cb(null, true);
//    } else {
//      cb(new Error('Invalid file type. Only images, PDFs, and Word documents are allowed.'), false);
//    }
//  }
//});
//
//// Multer upload for post images (multiple files)
//const uploadPostImages = multer({
//  storage: postImagesStorage,
//  limits: {
//    fileSize: 5 * 1024 * 1024, // 5MB per image
//    files: 5 // Maximum 5 images per post
//  },
//  fileFilter: (req, file, cb) => {
//    const allowedTypes = ['image/jpeg', 'image/png'];
//    if (allowedTypes.includes(file.mimetype)) {
//      cb(null, true);
//    } else {
//      cb(new Error('Invalid image format. Only JPEG and PNG are allowed.'), false);
//    }
//  }
//});
//
//module.exports = {
//  cloudinary,
//  videoStorage,
//  notesStorage,
//  postImagesStorage,
//  uploadVideo,
//  uploadNotes,
//  uploadPostImages, // Make sure this is included
//  upload: uploadPostImages // Add this alias for backward compatibility
//};

// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper function to determine resource type
const getResourceType = (mimetype) => {
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('image/')) return 'image';
  return 'raw';
};

// Helper function to determine format
const getFormat = (mimetype) => {
  const parts = mimetype.split('/');
  if (parts[1] === 'vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (parts[1] === 'msword') return 'doc';
  return parts[1];
};

// Storage configuration for videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'school-videos',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
    resource_type: 'video',
    format: async (req, file) => getFormat(file.mimetype),
    transformation: [{ quality: 'auto' }]
  }
});

// Storage configuration for notes (existing)
const notesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'school-notes',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt'],
    resource_type: 'raw',
    format: async (req, file) => getFormat(file.mimetype)
  }
});

// Storage configuration for post images (existing)
const postImagesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'post-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    resource_type: 'image',
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

// NEW: Storage configuration for teacher resources
const teacherResourcesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'teacher-resources',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto',
    use_filename: true,
    unique_filename: false,
    overwrite: false,
    format: async (req, file) => {
      // Get extension from original filename
      const ext = file.originalname.split('.').pop().toLowerCase();
      return ext;
    },
    transformation: [{ quality: 'auto' }]
  }
});

// Export all upload configurations
module.exports = {
  cloudinary,
  uploadVideo: multer({ storage: videoStorage }),
  uploadNotes: multer({ storage: notesStorage }),
  uploadPostImages: multer({ storage: postImagesStorage }),
  uploadTeacherResources: multer({ storage: teacherResourcesStorage })
};