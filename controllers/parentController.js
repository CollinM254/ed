const mongoose = require('mongoose');
const Parent = require('../models/Parent');
const Learner = require('../models/Learner');

// Get detailed parent profile information
exports.getParentProfile = async (req, res) => {
  const { parentId } = req.params;

  try {
    // Validate parentId
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ message: 'Invalid parent ID format' });
    }

    // Get parent details
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    // Get all children associated with this parent
    const children = await Learner.find({ parentId }).select('fullName class admissionNumber birthCertificateNumber gender');

    // Format the response
    const response = {
      parentDetails: {
        name: parent.parentName,
        email: parent.email,
        phone: parent.contactNumber,
        idNumber: parent.idNumber,
        gender: parent.gender,
        relationship: parent.relationship,
        registrationDate: parent.createdAt
      },
      children: children.map(child => ({
        name: child.fullName,
        class: child.class,
        admissionNumber: child.admissionNumber,
        birthCertificateNumber: child.birthCertificateNumber,
        gender: child.gender
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching parent profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update parent profile
exports.updateParentProfile = async (req, res) => {
  const { parentId } = req.params;
  const updates = req.body;

  try {
    // Validate parentId
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ message: 'Invalid parent ID format' });
    }

    // Update parent
    const updatedParent = await Parent.findByIdAndUpdate(
      parentId,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedParent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      parent: {
        name: updatedParent.parentName,
        email: updatedParent.email,
        phone: updatedParent.contactNumber
      }
    });
  } catch (error) {
    console.error('Error updating parent profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};