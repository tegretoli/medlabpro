const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Analysis = require('../models/Analysis');

router.get('/', protect, async (req, res) => {
  const { department, search } = req.query;
  const query = { isActive: true };
  if (department) query.department = department;
  if (search) query.name = new RegExp(search, 'i');
  const analyses = await Analysis.find(query).populate('department', 'name code color');
  res.json({ success: true, analyses });
});

router.get('/:id', protect, async (req, res) => {
  const analysis = await Analysis.findById(req.params.id).populate('department');
  if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
  res.json({ success: true, analysis });
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  const analysis = await Analysis.create(req.body);
  res.status(201).json({ success: true, analysis });
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const analysis = await Analysis.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
  res.json({ success: true, analysis });
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Analysis.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Analysis deactivated' });
});

module.exports = router;
