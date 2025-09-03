const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  class: { type: String, required: true }, // e.g., Grade 6
  subject: { type: String, required: true },
  fileUrl: { type: String, required: true }, // Cloudinary URL
  fileType: { type: String, required: true }, // pdf, doc, image
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Note', noteSchema);