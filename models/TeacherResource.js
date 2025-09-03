// models/TeacherResource.js
const mongoose = require('mongoose');

const teacherResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['Mathematics', 'English', 'Kiswahili/KSL', 'Integrated Science', 'Social Studies', 'CRE', 'IRE', 'History', 'Geography', 'Business','Pretechnical Studies','Creative Arts and Sports', 'Agriculture and Nutrition']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
  },
//  public id
  publicId: String,
    resourceType: {
      type: String,
      enum: ['image', 'video', 'raw'],
      default: 'raw'
    },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
//    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
teacherResourceSchema.index({ class: 1, subject: 1 });
teacherResourceSchema.index({ uploadedBy: 1 });

const TeacherResource = mongoose.model('TeacherResource', teacherResourceSchema);

module.exports = TeacherResource;