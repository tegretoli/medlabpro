const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', protect, authorize('admin'), async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users });
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  const user = await User.create(req.body);
  const { password, ...userData } = user.toJSON();
  res.status(201).json({ success: true, user: userData });
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const { password, ...data } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, data, { new: true }).select('-password');
  res.json({ success: true, user });
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'Cannot delete own account' });
  }
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'User deactivated' });
});

module.exports = router;
