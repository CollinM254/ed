// models/ParentRequestTransfer.js
const mongoose = require('mongoose');

const ParentRequestTransferSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  childName: {
    type: String,
    required: true,
  },
  admissionNumber: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    minlength: 200,
  },
  status: {
    type: String,
    enum: ['Sent', 'Received', 'Processing', 'Processed'],
    default: 'Sent',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ParentRequestTransfer', ParentRequestTransferSchema);