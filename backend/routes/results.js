const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Result = require('../models/Result');
const Analysis = require('../models/Analysis');
const Patient = require('../models/Patient');
const Referrer = require('../models/Referrer');

// GET all results
router.get('/', protect, async (req, res) => {
  const { patient, status, department, from, to, page = 1, limit = 20 } = req.query;
  const query = {};
  if (patient) query.patient = patient;
  if (status) query.status = status;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  let resultsQuery = Result.find(query)
    .populate({ path: 'patient', select: 'firstName lastName caseId gender dateOfBirth' })
    .populate({ path: 'analysis', select: 'name code department', populate: { path: 'department', select: 'name color' } })
    .populate('techValidatedBy', 'firstName lastName')
    .populate('biochemistValidatedBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  if (department) {
    // Filter by department through analysis
    const analyses = await Analysis.find({ department }).select('_id');
    query.analysis = { $in: analyses.map(a => a._id) };
  }

  const total = await Result.countDocuments(query);
  const results = await resultsQuery.skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, results });
});

// GET single result
router.get('/:id', protect, async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate({ path: 'patient', populate: { path: 'referrer' } })
    .populate({ path: 'analysis', populate: { path: 'department' } })
    .populate('techValidatedBy', 'firstName lastName licenseNumber')
    .populate('biochemistValidatedBy', 'firstName lastName licenseNumber');
  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
  res.json({ success: true, result });
});

// POST create result
router.post('/', protect, async (req, res) => {
  const { patientId, analysisId, components } = req.body;

  const patient = await Patient.findById(patientId).populate('referrer');
  const analysis = await Analysis.findById(analysisId);
  if (!patient || !analysis) return res.status(404).json({ success: false, message: 'Patient or Analysis not found' });

  // Determine price
  let price = analysis.standardPrice;
  let isCollaboratorPrice = false;
  if (patient.referrer?.isCollaborator) {
    // Check custom prices first
    const customPrice = patient.referrer.customPrices?.find(cp => cp.analysis.toString() === analysisId);
    if (customPrice) {
      price = customPrice.price;
    } else if (patient.referrer.pricingType === 'percentage') {
      price = price * (1 - patient.referrer.discountPercentage / 100);
    } else if (analysis.collaboratorPrice) {
      price = analysis.collaboratorPrice;
    }
    isCollaboratorPrice = true;
  }

  const resultComponents = (components || analysis.components).map((comp, idx) => ({
    componentName: comp.componentName || comp.name,
    value: comp.value || '',
    unit: comp.unit || '',
    referenceRange: comp.referenceRange || '',
    flag: comp.flag || '',
    displayOrder: idx
  }));

  const result = await Result.create({
    patient: patientId,
    analysis: analysisId,
    caseId: patient.caseId,
    components: resultComponents,
    price,
    isCollaboratorPrice,
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, result });
});

// PUT update result components
router.put('/:id', protect, async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
  if (result.status === 'biochemist_validated') {
    return res.status(400).json({ success: false, message: 'Cannot edit validated result' });
  }
  Object.assign(result, req.body);
  await result.save();
  res.json({ success: true, result });
});

// POST validate result
router.post('/:id/validate', protect, async (req, res) => {
  const { level } = req.body; // 'tech' or 'biochemist'
  const result = await Result.findById(req.params.id);
  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

  if (level === 'tech') {
    if (!['lab_technician', 'biochemist', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized for tech validation' });
    }
    result.status = 'tech_validated';
    result.techValidatedAt = new Date();
    result.techValidatedBy = req.user._id;
  } else if (level === 'biochemist') {
    if (!['biochemist', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized for biochemist validation' });
    }
    result.status = 'biochemist_validated';
    result.biochemistValidatedAt = new Date();
    result.biochemistValidatedBy = req.user._id;
  }
  await result.save();
  res.json({ success: true, result });
});

module.exports = router;
