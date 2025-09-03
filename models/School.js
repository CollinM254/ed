
// // const mongoose = require('mongoose');

// // const schoolSchema = new mongoose.Schema({
// //   schoolName: {
// //     type: String,
// //     required: true,
// //   },
// //   schoolCode: {
// //     type: String,
// //     required: true,
// //     unique: true,
// //   },
// //   county: {
// //     type: String,
// //     required: true,
// //   },
// //   subcounty: {
// //     type: String,
// //     required: true,
// //   },
// //   location: {
// //     type: String,
// //     required: true,
// //   },
// //   village: {
// //     type: String,
// //     required: true,
// //   },
// //   address: {
// //     type: String,
// //     required: true,
// //   },
// //   phoneNumber: {
// //     type: String,
// //     required: true,
// //     match: /^[0-9]{10}$/,
// //   },
// //   email: {
// //     type: String,
// //     required: true,
// //     unique: true,
// //     match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
// //   },
// //   website: {
// //     type: String,
// //   },
// //   activationToken: {
// //     type: String,
// //   },
// //   isActive: {
// //     type: Boolean,
// //     default: false,
// //   },
// // });

// // module.exports = mongoose.model('School', schoolSchema);

// const mongoose = require('mongoose');

// const schoolSchema = new mongoose.Schema({
//   schoolName: {
//     type: String,
//     required: true,
//   },
//   schoolCode: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   county: {
//     type: String,
//     required: true,
//   },
//   subcounty: {
//     type: String,
//     required: true,
//   },
//   location: {
//     type: String,
//     required: true,
//   },
//   village: {
//     type: String,
//     required: true,
//   },
//   address: {
//     type: String,
//     required: true,
//   },
//   phoneNumber: {
//     type: String,
//     required: true,
//     match: /^[0-9]{10}$/,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//   },
//   website: {
//     type: String,
//   },
//   activationToken: {
//     type: String,
//   },
//   isActive: {
//     type: Boolean,
//     default: false,
//   },
//   // New fields for streams
//   maxStreamsPerClass: {
//     type: Number,
//     default: 1,
//   },
//   classStreams: {
//     type: Map,
//     of: [String], // This will store streams for each class
//     default: {},
//   },
// });

// module.exports = mongoose.model('School', schoolSchema);

const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
  },
  schoolCode: {
    type: String,
    required: true,
    unique: true,
  },
  county: {
    type: String,
    required: true,
  },
  subcounty: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  village: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  website: {
    type: String,
  },
  activationToken: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  // New fields for streams
  maxStreamsPerClass: {
    type: Number,
    default: 1,
  },
  classStreams: {
    type: Map,
    of: [String], // This will store streams for each class
    default: {},
  },
  // Add these new fields for verification code
  verificationCode: {
    type: String,
  },
  verificationCodeExpires: {
    type: Date,
  },
  verificationAttempts: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true // Optional: adds createdAt and updatedAt fields
});

module.exports = mongoose.model('School', schoolSchema);