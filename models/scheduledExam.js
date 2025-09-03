const mongoose = require('mongoose');

const scheduledExamSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  term: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3'],
    required: true,
  },
  examType: {
    type: String,
    enum: ['Opener Exam', 'Midterm Exam', 'End of Term Exam', 'Random Exams', 'Other Exams'],
    required: true,
  },
  examName: {
    type: String,
    trim: true,
    default: null,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ScheduledExam', scheduledExamSchema);