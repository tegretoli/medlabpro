const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Patient = require('../models/Patient');
const Result = require('../models/Result');

// GET all patients
router.get('/', protect, async (req, res) => {
  const { search, page = 1, limit = 20, from, to } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { caseId: new RegExp(search, 'i') }
    ];
  }
  if (from || to) {
    query.visitDate = {};
    if (from) query.visitDate.$gte = new Date(from);
    if (to) query.visitDate.$lte = new Date(to);
  }
  const total = await Patient.countDocuments(query);
  const patients = await Patient.find(query)
    .populate('referrer', 'firstName lastName organizationName specialty')
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, total, page: Number(page), patients });
});

// GET single patient
router.get('/:id', protect, async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate('referrer')
    .populate('createdBy', 'firstName lastName');
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  const results = await Result.find({ patient: patient._id })
    .populate('analysis', 'name code department')
    .sort({ createdAt: -1 });
  res.json({ success: true, patient, results });
});

// POST create patient
router.post('/', protect, authorize('admin', 'reception'), async (req, res) => {
  const patient = await Patient.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, patient });
});

// PUT update patient
router.put('/:id', protect, authorize('admin', 'reception'), async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  res.json({ success: true, patient });
});

// DELETE patient
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await Patient.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Patient deleted' });
});

module.exports = router;
