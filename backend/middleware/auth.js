const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  // Auth disabled — set default admin user
  const User = require('../models/User');
  req.user = await User.findOne({ role: 'admin' });
  if (!req.user) {
    // Fallback nëse DB është bosh
    req.user = { _id: '000000000000000000000001', role: 'admin', firstName: 'Admin', lastName: 'User' };
  }
  next();
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not authorized` });
  }
  next();
};
