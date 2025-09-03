const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Scholarship', 'Fellowship', 'Internship', 'Grant', 'Competition', 'Exchange Program']
  },
  deadline: {
    type: Date,
    required: true,
  },
  hostOrganization: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  eligibleCountries: {
    type: String,
    required: true,
  },
  fieldsOfStudy: {
    type: String,
    required: true,
  },
  benefits: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  eligibilityCriteria: {
    type: String,
    required: true,
  },
  applicationProcess: {
    type: String,
    required: true,
  },
  officialLink: {
    type: String,
    required: true,
  },
  contactInformation: {
    type: String,
  },
  selectionProcess: {
    type: String,
  },
  additionalNotes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Scholarship', scholarshipSchema);