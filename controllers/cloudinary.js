const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kids_matter_videos', // Folder in Cloudinary
    resource_type: 'video', // Specify resource type as video
  },
});

// Create Multer upload middleware
const upload = multer({ storage });

module.exports = { cloudinary, storage, upload }; // Export upload middleware


//const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');
//
// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
//
// // Set up Cloudinary storage for Multer
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'kids_matter_videos', // Folder in Cloudinary
//     resource_type: 'video', // Specify resource type as video
//   },
// });
//// Create Multer upload middleware
//const upload = multer({
//  storage: storage,
//  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB file size limit
//});
//
//module.exports = { cloudinary, storage, upload }; // Export upload middleware