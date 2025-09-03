// const mongoose = require('mongoose');

// const deletedStudentSchema = new mongoose.Schema({
//   fullName: {
//     type: String,
//     required: true
//   },
//   admissionNumber: {
//     type: String,
//     required: true
//   },
//   parentName: {
//     type: String,
//     required: true
//   },
//   parentEmail: {
//     type: String,
//     required: true
//   },
//   parentContact: {
//     type: String,
//     required: true
//   },
//   deletedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('DeletedStudent', deletedStudentSchema);

const mongoose = require('mongoose');

const deletedStudentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  admissionNumber: {
    type: String,
    required: true
  },
  parentName: {
    type: String,
    required: true
  },
  parentEmail: {
    type: String,
    required: true
  },
  parentContact: {
    type: String,
    required: true
  },
  birthCertificateNumber: {
    type: String,
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  deletedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DeletedStudent', deletedStudentSchema);