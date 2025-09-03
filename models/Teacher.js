//const mongoose = require('mongoose');
//
//const teacherSchema = new mongoose.Schema({
//  fullName: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  email: {
//    type: String,
//    required: true,
//    unique: true, // Ensure email is unique
//    trim: true,
//    lowercase: true,
//  },
//  phoneNumber: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  subjectSpecialization: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  tscNumber: {
//    type: String,
//    required: true,
//    unique: true, // Ensure TSC number is unique
//    trim: true,
//  },
//  gender: {
//    type: String,
//    enum: ['M', 'F'], // Only allow 'M' or 'F'
//    required: true,
//  },
//  classRepresenting: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  createdAt: {
//    type: Date,
//    default: Date.now, // Automatically set the creation date
//  },
//});
//
//// Create the Teacher model
//const Teacher = mongoose.model('Teacher', teacherSchema);
//
//module.exports = Teacher;
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  subjectSpecialization: {
    type: String,
    required: true,
    trim: true,
  },
  tscNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['M', 'F'],
    required: true,
  },
  classRepresenting: {
    type: String,
    required: true,
    trim: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Teacher', teacherSchema);