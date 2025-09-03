// controllers/learnerController.js
const mongoose = require('mongoose');
const Learner = require('../models/Learner');

// Get detailed learner information
// Get Learner by ID
exports.getLearnerById = async (req, res) => {
  const { learnerId } = req.params;

  try {
    // Validate learnerId
    if (!mongoose.Types.ObjectId.isValid(learnerId)) {
      return res.status(400).json({ message: 'Invalid learner ID format' });
    }

    const learner = await Learner.findById(learnerId)
      .select('fullName class admissionNumber birthCertificateNumber gender dateOfBirth parentName parentContact parentEmail');

    if (!learner) {
      return res.status(404).json({ message: 'Learner not found' });
    }

    res.status(200).json(learner);
  } catch (error) {
    console.error('Error fetching learner details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};