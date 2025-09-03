const mongoose = require('mongoose');

const indisciplineCaseSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Learner',
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
    required: true
  },
  schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true
    },
    reportedBy: { // Remove this field or change to:
      type: String,
      enum: ['administration', 'teacher'],
      default: 'administration'
    },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['reported', 'resolved'],
    default: 'reported'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('IndisciplineCase', indisciplineCaseSchema);