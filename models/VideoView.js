// models/VideoView.js
const mongoose = require('mongoose');

const videoViewSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Learner',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VideoView', videoViewSchema);