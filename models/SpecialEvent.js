const mongoose = require('mongoose');

const specialEventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  attendingStudents: [{
    admissionNumber: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SpecialEvent', specialEventSchema);