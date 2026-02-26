const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Audit = require('../models/Audit');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  user.lastLogin = new Date();
  await user.save();

  await Audit.create({ user: user._id, action: 'login', resource: 'auth', ip: req.ip });

  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      licenseNumber: user.licenseNumber
    }
  });
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.logout = async (req, res) => {
  await Audit.create({ user: req.user._id, action: 'logout', resource: 'auth', ip: req.ip });
  res.json({ success: true, message: 'Logged out' });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) return res.status(400).json({ success: false, message: 'Current password incorrect' });
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
};
