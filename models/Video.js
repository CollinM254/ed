

// models/Video.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  class: { type: String, required: true },
  subject: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String }, // Add this for video thumbnails
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  uploadedAt: { type: Date, default: Date.now },
  duration: { type: Number } // in seconds
});

module.exports = mongoose.model('Video', videoSchema);