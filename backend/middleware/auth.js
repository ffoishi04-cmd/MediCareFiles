// ============================================================
// JWT Authentication & Role Authorization Middleware
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT Token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'ACCESS DENIED - No authentication token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'ACCESS DENIED - User not found'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'ACCESS DENIED - Account deactivated'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'ACCESS DENIED - Invalid or expired token'
    });
  }
};

// Role-based authorization
// Usage: authorize('admin', 'doctor')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `FORBIDDEN - Role '${req.user.role}' does not have access to this resource. Required: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
