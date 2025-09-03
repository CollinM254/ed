// models/DeletedSchool.js
const mongoose = require('mongoose');

const deletedSchoolSchema = new mongoose.Schema({
  originalId: String,
  schoolName: String,
  email: String,
  phoneNumber: String,
  location: String,
  village: String,
  subcounty: String,
  county: String,
  schoolCode: String,
  isActive: Boolean,
  createdAt: Date,
  deletedAt: { type: Date, default: Date.now },
  deletedBy: String
});

module.exports = mongoose.model('DeletedSchool', deletedSchoolSchema);