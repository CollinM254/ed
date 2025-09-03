const mongoose = require('mongoose');

const adminCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
     validate: {
        validator: v => /^\d{6}$/.test(v), // Ensure 6 digits
        message: 'Code must be 6 digits'
      }
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Automatically delete after 5 minutes (300 seconds)
  }
});

module.exports = mongoose.model('AdminCode', adminCodeSchema);