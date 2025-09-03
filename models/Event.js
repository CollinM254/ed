
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
  },
  venue: {
    type: String,
    required: true,
  },
  organizer: {
    type: String,
    required: true,
  },
  objective: {
    type: String,
    required: true,
  },
  targetAudience: {
    type: String,
    required: true,
  },
  eventTheme: {
    type: String,
  },
  schedule: {
    type: String,
    required: true,
  },
  keySpeakers: {
    type: String,
  },
  workshops: {
    type: String,
  },
  entryRequirements: {
    type: String,
  },
  parkingTransport: {
    type: String,
  },
  cateringRefreshments: {
    type: String,
  },
  dressCode: {
    type: String,
  },
  sponsorships: {
    type: String,
  },
  contactInformation: {
    type: String,
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

module.exports = mongoose.model('Event', eventSchema);