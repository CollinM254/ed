////const jwt = require('jsonwebtoken');
////const secretKey = process.env.JWT_SECRET || 'your-secret-key';
////
////exports.verifySchoolToken = (req, res, next) => {
////  const token = req.header('x-auth-token');
////
////  if (!token) {
////    return res.status(401).json({ message: 'No token, authorization denied' });
////  }
////
////  try {
////    const decoded = jwt.verify(token, secretKey);
////
////    if (decoded.role !== 'school') {
////      return res.status(401).json({ message: 'Not authorized as school' });
////    }
////
////    req.school = decoded;
////    next();
////  } catch (err) {
////    res.status(401).json({ message: 'Token is not valid' });
////  }
////};
//const jwt = require('jsonwebtoken');
//const School = require('../models/School');
//const secretKey = process.env.JWT_SECRET || 'your-secret-key';
//
//exports.verifySchoolToken = async (req, res, next) => {
//  const token = req.header('x-auth-token');
//
//  if (!token) {
//    return res.status(401).json({
//      success: false,
//      message: 'No token, authorization denied'
//    });
//  }
//
//  try {
//    const decoded = jwt.verify(token, secretKey);
//
//    if (decoded.role !== 'school') {
//      return res.status(403).json({
//        success: false,
//        message: 'Not authorized as school'
//      });
//    }
//
//    // Verify school exists and is active
//    const school = await School.findById(decoded._id);
//    if (!school || !school.isActive) {
//      return res.status(403).json({
//        success: false,
//        message: 'School account not found or inactive'
//      });
//    }
//
//    req.school = decoded;
//    next();
//  } catch (err) {
//    res.status(401).json({
//      success: false,
//      message: 'Token is not valid',
//      error: err.message
//    });
//  }
//};

const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'your-secret-key';

exports.verifySchoolToken = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    if (decoded.role !== 'school') {
      return res.status(401).json({ message: 'Not authorized as school' });
    }

    req.school = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.verifyAdminToken = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    if (decoded.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized as admin' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};