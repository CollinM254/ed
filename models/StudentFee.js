const mongoose = require('mongoose');

const studentFeeSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Learner',
    required: true
  },
  year: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true,
    enum: ['Term 1', 'Term 2', 'Term 3']
  },
  className: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  balance: {
    type: Number,
    default: function() {
      return this.totalAmount - this.amountPaid;
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudentFee', studentFeeSchema);