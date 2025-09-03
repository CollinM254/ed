const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'DWEIOJFEIOTUERTDJDFHJKSDGJKGHJKG';

exports.verifyAdminToken = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, secretKey);

    // Check if the token has admin role
    if (decoded.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized as admin' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
