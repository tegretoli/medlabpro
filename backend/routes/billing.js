const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Result = require('../models/Result');
const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const Referrer = require('../models/Referrer');

router.get('/report', protect, async (req, res) => {
  const { from, to, department, referrer } = req.query;
  const query = {};
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  const results = await Result.find(query)
    .populate({ path: 'patient', populate: { path: 'referrer', select: 'firstName lastName organizationName' } })
    .populate({ path: 'analysis', select: 'name', populate: { path: 'department', select: 'name' } });

  const filteredResults = results.filter(r => {
    if (department && r.analysis?.department?._id?.toString() !== department) return false;
    if (referrer && r.patient?.referrer?._id?.toString() !== referrer) return false;
    return true;
  });

  const totalRevenue = filteredResults.reduce((sum, r) => sum + r.price, 0);
  res.json({ success: true, results: filteredResults, totalRevenue, count: filteredResults.length });
});

router.get('/collaborator-invoice/:referrerId', protect, authorize('admin'), async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const referrer = await Referrer.findById(req.params.referrerId);
  if (!referrer) return res.status(404).json({ success: false, message: 'Referrer not found' });

  const patients = await Patient.find({ referrer: req.params.referrerId });
  const patientIds = patients.map(p => p._id);

  const results = await Result.find({
    patient: { $in: patientIds },
    createdAt: { $gte: start, $lte: end },
    status: 'biochemist_validated'
  }).populate('analysis', 'name code standardPrice collaboratorPrice')
    .populate('patient', 'firstName lastName caseId');

  const subtotal = results.reduce((sum, r) => sum + r.price, 0);

  res.json({
    success: true,
    invoice: {
      referrer,
      period: { month: Number(month), year: Number(year) },
      results,
      subtotal,
      total: subtotal
    }
  });
});

router.post('/invoices', protect, authorize('admin'), async (req, res) => {
  const count = await Invoice.countDocuments();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  const invoice = await Invoice.create({ ...req.body, invoiceNumber, createdBy: req.user._id });
  res.status(201).json({ success: true, invoice });
});

module.exports = router;
