// const mongoose = require("mongoose");

// const postSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     images: [
//       {
//         url: String,
//         publicId: String,
//       },
//     ],
//     schoolId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "School",
//       required: true,
//     },
//     likes: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "School",
//       },
//     ],
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// // Add text index for search functionality
// postSchema.index({ title: "text", description: "text" });

// module.exports = mongoose.model("Post", postSchema);

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    url: String,
    publicId: String
  }],
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  }],
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add text index for search functionality
postSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Post', postSchema);