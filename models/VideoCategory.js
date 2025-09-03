// models/VideoCategory.js
const mongoose = require('mongoose');

const videoCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  category: {
    type: String,
    required: true,
    enum: ['general', 'creative', 'innovation', 'cartoons', 'playgroup']
  },
  uploadedBy: {
    type: String,  // Changed from ObjectId to String
    required: true,
    default: 'gov_admin' // Default value
  },
  uploadedAt: { type: Date, default: Date.now },
  duration: { type: Number }, // in seconds
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Learner' }]
});

module.exports = mongoose.model('VideoCategory', videoCategorySchema);