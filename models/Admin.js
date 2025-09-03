// models/Admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'gov_admin' // Fixed ID for your single admin
  },
  email: {
    type: String,
    default: 'xe.fusion.xe@gmail.com'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Admin', adminSchema);