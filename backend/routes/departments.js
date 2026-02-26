const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Department = require('../models/Department');

router.get('/', protect, async (req, res) => {
  const departments = await Department.find({ isActive: true }).populate('head', 'firstName lastName');
  res.json({ success: true, departments });
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  const dept = await Department.create(req.body);
  res.status(201).json({ success: true, dept });
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, dept });
});

module.exports = router;
