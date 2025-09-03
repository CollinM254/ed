const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  year: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true,
    enum: ['Term 1', 'Term 2', 'Term 3']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FeeStructure', feeStructureSchema);