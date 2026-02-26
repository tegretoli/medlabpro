const mongoose = require('mongoose');

const ResultComponentSchema = new mongoose.Schema({
  componentName: { type: String, required: true },
  value: { type: String },
  unit: { type: String },
  referenceRange: { type: String },
  flag: { type: String, enum: ['normal', 'low', 'high', 'critical_low', 'critical_high', ''], default: '' },
  displayOrder: { type: Number, default: 0 }
});

const ResultSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  analysis: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', required: true },
  caseId: { type: String, required: true },
  components: [ResultComponentSchema],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'tech_validated', 'biochemist_validated'],
    default: 'pending'
  },
  price: { type: Number, required: true },
  isCollaboratorPrice: { type: Boolean, default: false },
  notes: { type: String },
  collectedAt: { type: Date, default: Date.now },
  techValidatedAt: { type: Date },
  techValidatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  biochemistValidatedAt: { type: Date },
  biochemistValidatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pdfPath: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Result', ResultSchema);
