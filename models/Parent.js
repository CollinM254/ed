//const mongoose = require('mongoose');
//
//const parentSchema = new mongoose.Schema({
//  parentName: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  contactNumber: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  email: {
//    type: String,
//    required: true,
//    trim: true,
//    lowercase: true,
//  },
//  idNumber: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  gender: {
//    type: String,
//    enum: ['M', 'F'], // Only allow 'M' or 'F'
//    required: true,
//  },
//  relationship: {
//    type: String,
//    enum: ['Mom', 'Dad', 'Guardian'], // Only allow specific relationships
//    required: true,
//  },
//  learnerName: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  learnerGrade: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  learnerAdmissionNumber: {
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
//// Create the Parent model
//const Parent = mongoose.model('Parent', parentSchema);
//
//module.exports = Parent;


//const mongoose = require('mongoose');
//
//const parentSchema = new mongoose.Schema({
//  parentName: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  contactNumber: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  email: {
//    type: String,
//    required: true,
//    trim: true,
//    lowercase: true,
//  },
//  idNumber: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  gender: {
//    type: String,
//    enum: ['M', 'F'],
//    required: true,
//  },
//  relationship: {
//    type: String,
//    enum: ['Mom', 'Dad', 'Guardian'],
//    required: true,
//  },
//  learnerName: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  learnerGrade: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  learnerAdmissionNumber: {
//    type: String,
//    required: true,
//    trim: true,
//  },
//  schoolId: {
//    type: mongoose.Schema.Types.ObjectId,
//    ref: 'School',
//    required: true,
//  },
//  createdAt: {
//    type: Date,
//    default: Date.now,
//  },
//});
//
//module.exports = mongoose.model('Parent', parentSchema);
const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  parentName: {
    type: String,
    required: true,
    trim: true,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  idNumber: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['M', 'F'],
    required: true,
  },
  relationship: {
    type: String,
    enum: ['Mom', 'Dad', 'Guardian'],
    required: true,
  },
  learnerId: {
    type: mongoose.Schema.Types.ObjectId, // Add learnerId
    ref: 'Learner', // Reference the Learner model
    required: true,
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

module.exports = mongoose.model('Parent', parentSchema);