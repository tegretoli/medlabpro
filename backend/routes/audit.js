const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Audit = require('../models/Audit');

router.get('/', protect, authorize('admin'), async (req, res) => {
  const { page = 1, limit = 50, user, action, resource } = req.query;
  const query = {};
  if (user) query.user = user;
  if (action) query.action = action;
  if (resource) query.resource = resource;
  const total = await Audit.countDocuments(query);
  const logs = await Audit.find(query)
    .populate('user', 'firstName lastName role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, total, logs });
});

module.exports = router;
