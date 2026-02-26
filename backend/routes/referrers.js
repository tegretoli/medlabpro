const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Referrer = require('../models/Referrer');
const Result = require('../models/Result');
const Patient = require('../models/Patient');

router.get('/', protect, async (req, res) => {
  const { type, search, isCollaborator } = req.query;
  const query = { isActive: true };
  if (type) query.type = type;
  if (isCollaborator !== undefined) query.isCollaborator = isCollaborator === 'true';
  if (search) {
    query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { organizationName: new RegExp(search, 'i') }
    ];
  }
  const referrers = await Referrer.find(query).sort({ lastName: 1, organizationName: 1 });
  res.json({ success: true, referrers });
});

router.get('/:id', protect, async (req, res) => {
  const referrer = await Referrer.findById(req.params.id).populate('customPrices.analysis', 'name code');
  if (!referrer) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, referrer });
});

router.get('/:id/stats', protect, async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const patients = await Patient.find({ referrer: req.params.id });
  const patientIds = patients.map(p => p._id);

  const results = await Result.find({
    patient: { $in: patientIds },
    createdAt: { $gte: start, $lte: end }
  }).populate('analysis', 'name code');

  const totalRevenue = results.reduce((sum, r) => sum + r.price, 0);
  res.json({ success: true, stats: { totalPatients: patients.length, monthlyResults: results.length, totalRevenue, results } });
});

router.post('/', protect, authorize('admin', 'reception'), async (req, res) => {
  const referrer = await Referrer.create(req.body);
  res.status(201).json({ success: true, referrer });
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const referrer = await Referrer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, referrer });
});

module.exports = router;
